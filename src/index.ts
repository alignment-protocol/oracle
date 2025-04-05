import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios'; // Assuming you'll use axios for OpenAI calls

// Load environment variables from .env file
dotenv.config();

// Import your program's IDL (Interface Definition Language)
// You'll need to copy the target/idl/alignment_protocol.json file
// from your main program build into this oracle project (e.g., into the 'src' folder)
import idl from './alignment_protocol.json'; // Adjust path if needed

// --- Configuration ---
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL!;
const ORACLE_KEYPAIR_PATH = process.env.ORACLE_KEYPAIR_PATH!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const ALIGNMENT_PROGRAM_ID_STR = process.env.ALIGNMENT_PROGRAM_ID!;
const PROGRAM_ID = new PublicKey(ALIGNMENT_PROGRAM_ID_STR);

const POLLING_INTERVAL_MS = 10000; // Check every 10 seconds

// --- Setup Solana Connection and Anchor ---

// Load Oracle wallet
const oracleSecretKey = JSON.parse(fs.readFileSync(ORACLE_KEYPAIR_PATH, 'utf-8'));
const oracleKeypair = Keypair.fromSecretKey(new Uint8Array(oracleSecretKey));
const oracleWallet = new Wallet(oracleKeypair);

// Establish connection
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Setup Anchor provider
const provider = new AnchorProvider(connection, oracleWallet, AnchorProvider.defaultOptions());

// Create Anchor program instance
const program = new Program(idl as any, PROGRAM_ID, provider);

console.log(`Oracle started. Using Oracle wallet: ${oracleKeypair.publicKey.toBase58()}`);
console.log(`Monitoring Program ID: ${PROGRAM_ID.toBase58()}`);
console.log(`Connected to cluster: ${SOLANA_RPC_URL}`);

// --- State Management (Simple In-Memory) ---
// Keep track of requests currently being processed to avoid race conditions/duplicates
const processingRequests = new Set<string>();

// --- Main Polling Loop ---
async function pollForRequests() {
    console.log(`Polling for pending AI validation requests... (Processing ${processingRequests.size})`);
    try {
        // 1. Fetch ALL AiValidationRequest accounts owned by the program
        // This is the key step to FIND the requests on-chain
        const allAiRequests = await program.account.aiValidationRequest.all();
        // console.log(`Found ${allAiRequests.length} total AiValidationRequest accounts.`);

        // 2. Filter for PENDING requests that are not already being processed
        const pendingRequests = allAiRequests.filter(req => {
            // Access the 'status' field within the deserialized account data
            // Note: The exact structure depends on your IDL's enum representation.
            // It might be req.account.status.pending or req.account.status.hasOwnProperty('pending')
            // Check your IDL or log the object structure if unsure.
            // Assuming status is an object like { pending: {} } or { completed: {} } etc.
            const isPending = req.account.status.hasOwnProperty('pending');
            const pubkeyStr = req.publicKey.toBase58();
            const isAlreadyProcessing = processingRequests.has(pubkeyStr);

            return isPending && !isAlreadyProcessing;
        });

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
                .catch(error => {
                    console.error(`Error processing request ${pubkeyStr}:`, error);
                    // Handle error appropriately (e.g., update status on-chain to Failed, log, retry?)
                })
                .finally(() => {
                    // Ensure we remove it from the processing set even if it fails
                    processingRequests.delete(pubkeyStr);
                    console.log(`Finished processing (or failed) request: ${pubkeyStr}. Remaining: ${processingRequests.size}`);
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
async function processAiValidationRequest(requestPubkey: PublicKey, requestAccount: any /* Use generated types if available */) {
    // Fetch related accounts needed for the OpenAI prompt (Topic, Submission)
    // The SubmissionTopicLink pubkey is inside the requestAccount
    const submissionTopicLinkPubkey = requestAccount.submissionTopicLink;
    const submissionTopicLinkAccount = await program.account.submissionTopicLink.fetch(submissionTopicLinkPubkey);

    // The Topic and Submission pubkeys are inside the SubmissionTopicLink account
    const topicPubkey = submissionTopicLinkAccount.topic;
    const submissionPubkey = submissionTopicLinkAccount.submission;

    const topicAccount = await program.account.topic.fetch(topicPubkey);
    const submissionAccount = await program.account.submission.fetch(submissionPubkey);

    // TODO: Call OpenAI API
    const aiDecision = await callOpenAI(
        topicAccount.name,
        topicAccount.description,
        submissionAccount.dataReference
    ); // Returns VoteChoice enum { yes: {} } or { no: {} }

    // TODO: Call the submit_ai_vote instruction on-chain
    console.log(`Submitting AI vote (${aiDecision.hasOwnProperty('yes') ? 'Yes' : 'No'}) for request ${requestPubkey.toBase58()}...`);

    const txSignature = await program.methods
        .submitAiVote(aiDecision) // Pass the AI's choice
        .accounts({
            aiValidationRequest: requestPubkey,
            submissionTopicLink: submissionTopicLinkPubkey,
            // TODO: Add ALL other accounts required by your submit_ai_vote instruction
            // e.g., topic: topicPubkey,
            // Make sure the 'oracle' account is the signer
            oracle: oracleKeypair.publicKey,
        })
        // Important: The oracle keypair MUST sign this transaction
        .signers([oracleKeypair])
        .rpc();

    console.log(`Successfully submitted AI vote for ${requestPubkey.toBase58()}. Transaction: ${txSignature}`);
    // The on-chain instruction should update the AiValidationRequest status to Completed
}

// --- OpenAI Call (Placeholder) ---
async function callOpenAI(name: string, description: string, dataReference: string): Promise<any /* VoteChoice enum type */> {
    console.log(`Calling OpenAI for:\n  Topic: ${name}\n  Desc: ${description}\n  Data: ${dataReference}`);
    // ... (Implement the actual API call using axios as shown previously) ...
    // Construct prompt, headers, body with function call spec
    // Parse the boolean result from OpenAI

    // --- Placeholder ---
    // Replace with actual API call and parsing
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    const simulatedDecision = Math.random() > 0.5; // Random decision for testing
    console.log(`Simulated OpenAI decision: ${simulatedDecision}`);
    // Return the decision in the format expected by your Anchor program's VoteChoice enum
    // Usually { yes: {} } or { no: {} }
    return simulatedDecision ? { yes: {} } : { no: {} };
    // --- End Placeholder ---
}


// --- Start the Oracle ---
pollForRequests(); // Start the first poll