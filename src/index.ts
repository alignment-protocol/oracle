import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  Wallet,
  setProvider,
} from "@coral-xyz/anchor";
// Import the types from the alignment_protocol IDL
import type { AlignmentProtocol } from "./types/alignment_protocol";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios"; // Assuming you'll use axios for OpenAI calls

// Load environment variables from .env file
dotenv.config();

// Import your program's IDL (Interface Definition Language)
// You'll need to copy the target/idl/alignment_protocol.json file
// from your main program build into this oracle project (e.g., into the 'src' folder)
import idl from "./idl.json"; // Adjust path if needed

// --- Configuration ---
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL!;
const ORACLE_KEYPAIR_PATH = process.env.ORACLE_KEYPAIR_PATH!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const ALIGNMENT_PROGRAM_ID_STR = process.env.ALIGNMENT_PROGRAM_ID!;
const PROGRAM_ID = new PublicKey(ALIGNMENT_PROGRAM_ID_STR);

const POLLING_INTERVAL_MS = 10000; // Check every 10 seconds

// --- Setup Solana Connection and Anchor ---

// Load Oracle wallet
const oracleSecretKey = JSON.parse(
  fs.readFileSync(ORACLE_KEYPAIR_PATH, "utf-8"),
);
const oracleKeypair = Keypair.fromSecretKey(new Uint8Array(oracleSecretKey));
const oracleWallet = new Wallet(oracleKeypair);

// Establish connection
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Setup Anchor provider
const provider = new AnchorProvider(
  connection,
  oracleWallet,
  AnchorProvider.defaultOptions(),
);

setProvider(provider);
// Create Anchor program instance
const program = new Program(
  idl as AlignmentProtocol,
  provider,
) as Program<AlignmentProtocol>;

console.log(
  `Oracle started. Using Oracle wallet: ${oracleKeypair.publicKey.toBase58()}`,
);
console.log(`Monitoring Program ID: ${PROGRAM_ID.toBase58()}`);
console.log(`Connected to cluster: ${SOLANA_RPC_URL}`);

// Derive the State PDA (needed for submit_ai_vote)
const [statePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("state")],
  PROGRAM_ID,
);
console.log(`Derived State PDA: ${statePda.toBase58()}`);

// --- State Management (Simple In-Memory) ---
// Keep track of requests currently being processed to avoid race conditions/duplicates
const processingRequests = new Set<string>();

// --- Main Polling Loop ---
async function pollForRequests() {
  console.log(
    `Polling for pending AI validation requests... (Processing ${processingRequests.size})`,
  );
  try {
    // 1. Fetch ALL AiValidationRequest accounts owned by the program
    // This is the key step to FIND the requests on-chain
    const allAiRequests = await program.account.aiValidationRequest.all();
    // console.log(`Found ${allAiRequests.length} total AiValidationRequest accounts.`);

    // 2. Filter for PENDING requests that are not already being processed
    const pendingRequests = allAiRequests.filter(
      (req: {
        publicKey: PublicKey;
        account: any /* AiValidationRequest */;
      }) => {
        // Access the 'status' field within the deserialized account data
        // Note: The exact structure depends on your IDL's enum representation.
        // It might be req.account.status.pending or req.account.status.hasOwnProperty('pending')
        // Check your IDL or log the object structure if unsure.
        // Assuming status is an object like { pending: {} } or { completed: {} } etc.
        const isPending = req.account.status.hasOwnProperty("pending");
        const pubkeyStr = req.publicKey.toBase58();
        const isAlreadyProcessing = processingRequests.has(pubkeyStr);

        return isPending && !isAlreadyProcessing;
      },
    );

    if (pendingRequests.length > 0) {
      console.log(`Found ${pendingRequests.length} new PENDING requests.`);
    }

    // 3. Process each pending request (asynchronously)
    for (const request of pendingRequests) {
      const pubkeyStr = request.publicKey.toBase58();
      console.log(`Processing request: ${pubkeyStr}`);
      processingRequests.add(pubkeyStr); // Mark as processing

      // Don't wait for one to finish before starting the next
      processAiValidationRequest(request.publicKey, request.account as any)
        .catch((error) => {
          console.error(`Error processing request ${pubkeyStr}:`, error);
          // Handle error appropriately (e.g., update status on-chain to Failed, log, retry?)
        })
        .finally(() => {
          // Ensure we remove it from the processing set even if it fails
          processingRequests.delete(pubkeyStr);
          console.log(
            `Finished processing (or failed) request: ${pubkeyStr}. Remaining: ${processingRequests.size}`,
          );
        });
    }
  } catch (error) {
    console.error("Error during polling:", error);
  } finally {
    // Schedule the next poll
    setTimeout(pollForRequests, POLLING_INTERVAL_MS);
  }
}

// --- Processing Logic ---
async function processAiValidationRequest(
  requestPubkey: PublicKey,
  requestAccount: any /* Use generated types if available, e.g., AiValidationRequest */,
) {
  try {
    // Fetch related accounts needed for the OpenAI prompt (Topic, Submission)
    const submissionTopicLinkPubkey = requestAccount.submissionTopicLink;
    const submissionTopicLinkAccount =
      await program.account.submissionTopicLink.fetch(
        submissionTopicLinkPubkey,
      );

    const topicPubkey = submissionTopicLinkAccount.topic;
    const submissionPubkey = submissionTopicLinkAccount.submission;

    const topicAccount = await program.account.topic.fetch(topicPubkey);
    const submissionAccount =
      await program.account.submission.fetch(submissionPubkey);

    // 1. Call OpenAI API
    const aiDecision = await callOpenAI(
      topicAccount.name,
      topicAccount.description,
      submissionAccount.dataReference,
    ); // Returns VoteChoice enum { yes: {} } or { no: {} }

    // Read the index stored within the request account
    const aiRequestIndex = requestAccount.requestIndex;
    if (aiRequestIndex === undefined || aiRequestIndex === null) {
      throw new Error(
        `Request index (requestIndex) not found on account ${requestPubkey.toBase58()}. Check IDL and account data.`,
      );
    }
    console.log(`Using request index: ${aiRequestIndex} for vote submission.`);

    // 2. Call the submit_ai_vote instruction on-chain
    console.log(
      `Submitting AI vote (${aiDecision.hasOwnProperty("yes") ? "Yes" : "No"}) for request ${requestPubkey.toBase58()}...`,
    );

    const txSignature = await program.methods
      .submitAiVote(aiRequestIndex, aiDecision) // Pass the index FIRST, then the decision
      .accounts({
        oracle: oracleKeypair.publicKey,
        state: statePda,
        aiValidationRequest: requestPubkey,
        submissionTopicLink: submissionTopicLinkPubkey,
      } as any)
      .signers([oracleKeypair])
      .rpc({ commitment: "confirmed" });

    console.log(
      `Successfully submitted AI vote for ${requestPubkey.toBase58()}. Transaction: ${txSignature}`,
    );
    // The on-chain instruction should update the AiValidationRequest status to Completed
  } catch (error) {
    console.error(
      `Failed to process request ${requestPubkey.toBase58()}:`,
      error,
    );
    // Optionally, you could try to update the request status to 'Failed' on-chain here
    // This would require another instruction or modification of submit_ai_vote
  }
}

// --- OpenAI Call ---
async function callOpenAI(
  topicName: string,
  topicDescription: string,
  submissionDataReference: string,
): Promise<any /* VoteChoice enum type */> {
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const systemPrompt = `Given the following topic details and submitted data reference, evaluate whether the submission content (implied by the data reference) is appropriate, relevant, and valuable enough to be accepted into the topic. Respond ONLY using the provided function call.

Topic Name: ${topicName}
Topic Description: ${topicDescription}

Submitted Data Reference: ${submissionDataReference}

Based on the topic's goal and the data reference, should this submission be accepted? Answer True for acceptance (Yes vote), False for rejection (No vote).`;

  const requestBody = {
    model: "gpt-4o", // Or your preferred model
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user", // A minimal user message might be needed
        content: "Evaluate the submission based on the system prompt.",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "evaluate_submission_acceptance",
          description:
            "Determine if the submission should be accepted based on topic relevance and quality.",
          parameters: {
            type: "object",
            properties: {
              should_accept: {
                type: "boolean",
                description:
                  "True if the submission should be accepted, False otherwise.",
              },
            },
            required: ["should_accept"],
            additionalProperties: false,
          },
          // strict: true // Optional: enforce strict adherence
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "evaluate_submission_acceptance" },
    }, // Force the function call
  };

  try {
    console.log(
      `Calling OpenAI for Topic: ${topicName}, Data: ${submissionDataReference}`,
    );
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    // Extract the function call arguments
    const toolCalls = response.data.choices[0]?.message?.tool_calls;
    if (!toolCalls || toolCalls.length === 0 || !toolCalls[0].function) {
      throw new Error("OpenAI did not return the expected function call.");
    }

    const functionArgs = JSON.parse(toolCalls[0].function.arguments);
    const acceptanceDecision: boolean = functionArgs.should_accept;

    console.log(`OpenAI decision: ${acceptanceDecision}`);

    // Return the decision in the format expected by Anchor VoteChoice enum
    return acceptanceDecision ? { yes: {} } : { no: {} };
  } catch (error: any) {
    console.error(
      "Error calling OpenAI API:",
      error.response?.data || error.message,
    );
    // Handle error - perhaps default to 'No' or retry? For now, re-throwing.
    // Defaulting to 'No' might be safer in a production scenario.
    // throw new Error("Failed to get valid response from OpenAI");
    console.warn("OpenAI call failed. Defaulting to rejection (No vote).");
    return { no: {} }; // Default to No on failure
  }
}

// --- Start the Oracle ---
pollForRequests(); // Start the first poll
