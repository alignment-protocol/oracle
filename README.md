# Alignment Protocol Oracle

This directory contains the oracle component for the Alignment Protocol.

The oracle is responsible for monitoring the Solana blockchain for `AiValidationRequest` events initiated by users. When a user requests AI validation for their submission (spending their temporary Reputation tokens - `tempRep`), the oracle:

1.  Fetches the details of the submission and its corresponding topic from the blockchain.
2.  Constructs a prompt containing the topic name, description, and the submitted data reference.
3.  Queries an external AI service (e.g., OpenAI API) using this prompt to obtain a validation decision (Accept/Reject).
4.  Calls a specific instruction (`submit_ai_vote`) on the Alignment Protocol Solana program, submitting the AI's decision. This allows the AI's vote (weighted by the `tempRep` the user staked for the request) to be included in the overall validation tally for the submission.

This mechanism helps bootstrap the validation process, especially when the network has few active human validators, by allowing contributors to leverage AI for initial assessment at the cost of their own reputation tokens.

## Running the Oracle

1. Compile the TypeScript code (if needed, usually handled by the start script):
   ```bash
   npm run build
   ```
2. Start the oracle process:
   ```bash
   npm run start
   ```

Make sure the oracle's keypair (`oracle-keypair.json`) has sufficient SOL balance on the target cluster to pay for transaction fees.
