/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/alignment_protocol.json`.
 */
export type AlignmentProtocol = {
  address: "T4E39enXA8obNv8iT8Sx58UoiaEcWCpg1SqBr33d28V";
  metadata: {
    name: "alignmentProtocol";
    version: "0.2.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "commitVote";
      docs: [
        "Instruction handler: Commit a vote on a submission within a topic",
        "",
        "This creates a vote commitment without revealing the actual vote choice.",
        "The actual vote is hashed with a nonce for privacy during the commit phase.",
      ];
      discriminator: [134, 97, 90, 126, 91, 66, 16, 26];
      accounts: [
        {
          name: "state";
        },
        {
          name: "submissionTopicLink";
          writable: true;
        },
        {
          name: "topic";
        },
        {
          name: "submission";
        },
        {
          name: "voteCommit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 111, 116, 101, 95, 99, 111, 109, 109, 105, 116];
              },
              {
                kind: "account";
                path: "submissionTopicLink";
              },
              {
                kind: "account";
                path: "validator";
              },
            ];
          };
        },
        {
          name: "userProfile";
          docs: [
            "Validator's profile (needed for constraints and rep_ata check)",
          ];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "validator";
              },
            ];
          };
        },
        {
          name: "userTopicBalance";
          docs: [
            "Validator's topic-specific balance account for this topic.",
            "MUST be initialized first. Only used if is_permanent_rep is false.",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "validator";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "validatorRepAta";
          docs: [
            "Validator's permanent Rep ATA (user-owned).",
            "Only needed if is_permanent_rep is true. We pass it regardless for simplicity,",
            "but only read its balance conditionally in the instruction.",
          ];
        },
        {
          name: "validator";
          docs: ["The validator committing the vote"];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "voteHash";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "voteAmount";
          type: "u64";
        },
        {
          name: "isPermanentRep";
          type: "bool";
        },
      ];
    },
    {
      name: "createTopic";
      docs: [
        "Instruction handler: Create a new topic",
        "",
        "This creates a new topic that submissions can be added to.",
        "Only the protocol authority can create topics.",
      ];
      discriminator: [17, 149, 231, 194, 81, 173, 176, 41];
      accounts: [
        {
          name: "state";
          writable: true;
        },
        {
          name: "topic";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 112, 105, 99];
              },
              {
                kind: "account";
                path: "state.topic_count";
                account: "state";
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
          relations: ["state"];
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "name";
          type: "string";
        },
        {
          name: "description";
          type: "string";
        },
        {
          name: "commitPhaseDuration";
          type: {
            option: "u64";
          };
        },
        {
          name: "revealPhaseDuration";
          type: {
            option: "u64";
          };
        },
      ];
    },
    {
      name: "createUserAta";
      docs: [
        "Instruction handler: explicitly create user's ATA for permanent tokens (Align, Rep)",
        "",
        "This does NOT use `init_if_needed`. Instead, it does a CPI to the associated_token::create method.",
        "If the ATA already exists, this transaction will fail (unless you do extra checks).",
      ];
      discriminator: [116, 8, 187, 108, 154, 156, 168, 73];
      accounts: [
        {
          name: "state";
          docs: ["The state account containing all mint references"];
        },
        {
          name: "payer";
          docs: ["The person paying for creating the ATA"];
          writable: true;
          signer: true;
        },
        {
          name: "user";
          docs: ["The user for whom we want to create an ATA"];
          writable: true;
          signer: true;
        },
        {
          name: "userProfile";
          docs: ["The user's profile, needs mut to store the new ATA address"];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "mint";
          docs: [
            "The mint for which we want the user's ATA (only permanent token mints)",
          ];
          writable: true;
        },
        {
          name: "userAta";
          docs: [
            "The Associated Token Account (will be created if it doesn't exist)",
            "We do not use `init_if_needed`; we do a CPI call to the ATA program explicitly below.",
          ];
          writable: true;
        },
        {
          name: "systemProgram";
          docs: ["Programs"];
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "createUserProfile";
      docs: [
        "Instruction handler: Create a user profile for tracking reputation",
        "",
        "This creates a new PDA account to store the user's reputation metrics",
      ];
      discriminator: [9, 214, 142, 184, 153, 65, 50, 174];
      accounts: [
        {
          name: "state";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "userProfile";
          docs: ["The user profile account to be initialized."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "user";
          docs: ["The user creating the profile (payer and owner)"];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["System program - required for account initialization"];
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "createUserTempAlignAccount";
      docs: [
        "Instruction handler: create protocol-owned tempAlign token account for a user",
        "",
        "This creates a token account for tempAlign tokens that is owned by the protocol (state PDA)",
        "rather than the user, allowing the protocol to burn tokens without requiring user signatures.",
      ];
      discriminator: [62, 230, 237, 58, 113, 28, 253, 170];
      accounts: [
        {
          name: "state";
          docs: ["The state account containing protocol configuration"];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "payer";
          docs: ["The payer for the transaction"];
          writable: true;
          signer: true;
        },
        {
          name: "user";
          docs: [
            "The user for whom we're creating the account (but not the account owner)",
          ];
          signer: true;
        },
        {
          name: "userProfile";
          docs: [
            "The user's profile, needs mut to store the new token account address",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "mint";
          docs: ["The mint must be the tempAlign mint"];
          writable: true;
        },
        {
          name: "tokenAccount";
          docs: [
            "The token account will be a PDA owned by the program",
            "With the state as the authority, not the user",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  97,
                  108,
                  105,
                  103,
                  110,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "createUserTempRepAccount";
      docs: [
        "Instruction handler: create protocol-owned tempRep token account for a user",
        "",
        "This creates a token account for tempRep tokens that is owned by the protocol (state PDA)",
        "rather than the user, allowing the protocol to burn tokens without requiring user signatures.",
      ];
      discriminator: [177, 7, 118, 99, 70, 238, 90, 113];
      accounts: [
        {
          name: "state";
          docs: ["The state account containing protocol configuration"];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "payer";
          docs: ["The payer for the transaction"];
          writable: true;
          signer: true;
        },
        {
          name: "user";
          docs: [
            "The user for whom we're creating the account (but not the account owner)",
          ];
          signer: true;
        },
        {
          name: "userProfile";
          docs: [
            "The user's profile, needs mut to store the new token account address",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "mint";
          docs: ["The mint must be the tempRep mint"];
          writable: true;
        },
        {
          name: "tokenAccount";
          docs: [
            "The token account will be a PDA owned by the program",
            "With the state as the authority, not the user",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  114,
                  101,
                  112,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "finalizeSubmission";
      docs: [
        "Instruction handler: Finalize a submission within a topic after voting",
        "",
        "This determines if a submission is accepted or rejected based on voting results.",
        "For accepted submissions, it converts contributor's tempAlign tokens to permanent Align tokens.",
      ];
      discriminator: [81, 226, 24, 23, 32, 122, 132, 23];
      accounts: [
        {
          name: "state";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "submissionTopicLink";
          writable: true;
        },
        {
          name: "topic";
        },
        {
          name: "submission";
        },
        {
          name: "contributorProfile";
          docs: [
            "The contributor's user profile (needed for token account constraints)",
          ];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "submission.contributor";
                account: "submission";
              },
            ];
          };
        },
        {
          name: "userTopicBalance";
          docs: [
            "The contributor's topic-specific balance account for this topic.",
            "This holds the tempAlign to potentially convert.",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "submission.contributor";
                account: "submission";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "contributorTempAlignAccount";
          docs: [
            "The protocol-owned tempAlign token account for the contributor (for burning)",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  97,
                  108,
                  105,
                  103,
                  110,
                ];
              },
              {
                kind: "account";
                path: "submission.contributor";
                account: "submission";
              },
            ];
          };
        },
        {
          name: "contributorAlignAta";
          docs: [
            "The contributor's ATA for permanent alignment tokens (regular user-owned ATA)",
          ];
          writable: true;
        },
        {
          name: "tempAlignMint";
          docs: ["The tempAlign mint (for burning)"];
          writable: true;
        },
        {
          name: "alignMint";
          docs: ["The Align mint (for minting)"];
          writable: true;
        },
        {
          name: "authority";
          docs: [
            "The authority calling this instruction (can be any user, acts as payer)",
          ];
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "finalizeVote";
      docs: [
        "Instruction handler: Finalize a validator's vote after submission has been finalized",
        "",
        "This processes the token rewards or penalties for a validator based on their vote:",
        "- For correct votes: Burn tempRep tokens and mint permanent Rep tokens",
        "- For incorrect votes: Just burn tempRep tokens with no replacement",
        "- No penalty for permanent Rep tokens used for voting",
      ];
      discriminator: [181, 176, 6, 248, 249, 134, 146, 56];
      accounts: [
        {
          name: "state";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "submissionTopicLink";
          writable: true;
        },
        {
          name: "topic";
        },
        {
          name: "submission";
        },
        {
          name: "voteCommit";
          writable: true;
        },
        {
          name: "validatorProfile";
          docs: [
            "The validator's user profile (profile whose vote is being finalized)",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "vote_commit.validator";
                account: "voteCommit";
              },
            ];
          };
        },
        {
          name: "userTopicBalance";
          docs: [
            "Validator's topic-specific balance account for this topic.",
            "Used only if is_permanent_rep was false during commit.",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "validator_profile.user";
                account: "userProfile";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "validatorTempRepAccount";
          docs: [
            "The protocol-owned tempRep token account for this validator (for burning)",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  114,
                  101,
                  112,
                ];
              },
              {
                kind: "account";
                path: "validator_profile.user";
                account: "userProfile";
              },
            ];
          };
        },
        {
          name: "validatorRepAta";
          docs: [
            "The validator's ATA for permanent reputation tokens (for minting)",
            "This remains user-owned since permanent tokens belong to users",
          ];
          writable: true;
        },
        {
          name: "tempRepMint";
          docs: ["The tempRep mint (for burning)"];
          writable: true;
        },
        {
          name: "repMint";
          docs: ["The Rep mint (for minting)"];
          writable: true;
        },
        {
          name: "authority";
          docs: [
            "The signer finalizing the vote (can be anyone, not just the validator)",
          ];
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initializeAlignMint";
      docs: ["Instruction handler: initialize align_mint (Part 2b)"];
      discriminator: [121, 242, 44, 40, 234, 111, 42, 132];
      accounts: [
        {
          name: "state";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "alignMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 108, 105, 103, 110, 95, 109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initializeRepMint";
      docs: ["Instruction handler: initialize rep_mint (Part 2d)"];
      discriminator: [82, 162, 5, 205, 233, 169, 114, 148];
      accounts: [
        {
          name: "state";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "repMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 112, 95, 109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initializeState";
      docs: ["Instruction handler: initialize the protocol state (Part 1)"];
      discriminator: [190, 171, 224, 219, 217, 72, 199, 176];
      accounts: [
        {
          name: "state";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "oraclePubkey";
          type: "pubkey";
        },
      ];
    },
    {
      name: "initializeTempAlignMint";
      docs: ["Instruction handler: initialize temp_align_mint (Part 2a)"];
      discriminator: [1, 91, 57, 255, 223, 236, 40, 139];
      accounts: [
        {
          name: "state";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "tempAlignMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  116,
                  101,
                  109,
                  112,
                  95,
                  97,
                  108,
                  105,
                  103,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116,
                ];
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initializeTempRepMint";
      docs: ["Instruction handler: initialize temp_rep_mint (Part 2c)"];
      discriminator: [199, 32, 140, 188, 46, 223, 228, 127];
      accounts: [
        {
          name: "state";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "tempRepMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  116,
                  101,
                  109,
                  112,
                  95,
                  114,
                  101,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                ];
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initializeUserTopicBalance";
      docs: [
        "Instruction handler: Initialize a user's topic-specific balance account",
      ];
      discriminator: [183, 94, 172, 54, 240, 225, 57, 88];
      accounts: [
        {
          name: "user";
          docs: ["The user initializing this balance account"];
          writable: true;
          signer: true;
        },
        {
          name: "userProfile";
          docs: [
            "The user's profile (needed for constraint check, maybe not mutation)",
          ];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "topic";
          docs: ["The topic this balance is associated with"];
        },
        {
          name: "userTopicBalance";
          docs: [
            "The user's topic-specific balance account to be initialized.",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "linkSubmissionToTopic";
      docs: [
        "Instruction handler: Link an existing submission to a topic",
        "",
        "This creates a new SubmissionTopicLink for an existing Submission and Topic,",
        "allowing the submission to be voted on in multiple topics independently.",
        "Anyone can link if they are willing to pay the transaction fee.",
      ];
      discriminator: [180, 246, 74, 158, 77, 43, 117, 192];
      accounts: [
        {
          name: "state";
          writable: true;
        },
        {
          name: "topic";
          writable: true;
        },
        {
          name: "submission";
          docs: ["The existing submission to link to the topic"];
        },
        {
          name: "submissionTopicLink";
          docs: ["The link between submission and topic"];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  108,
                  105,
                  110,
                  107,
                ];
              },
              {
                kind: "account";
                path: "submission";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "authority";
          docs: [
            "The user linking the submission to the topic (could be contributor or authority)",
          ];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "requestAiValidation";
      docs: [
        "Instruction handler: Request AI validation for a submission",
        "",
        "Allows the original contributor to spend tempRep to have an AI vote on their submission.",
      ];
      discriminator: [92, 142, 52, 184, 196, 169, 114, 92];
      accounts: [
        {
          name: "requester";
          writable: true;
          signer: true;
        },
        {
          name: "submission";
          docs: ["The submission made by the requester"];
        },
        {
          name: "topic";
          docs: [
            "The topic the submission belongs to (needed for UserTopicBalance PDA derivation)",
          ];
        },
        {
          name: "submissionTopicLink";
          docs: ["The link between the submission and the topic"];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  108,
                  105,
                  110,
                  107,
                ];
              },
              {
                kind: "account";
                path: "submission";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "userTopicBalance";
          docs: [
            "User's balance account for this specific topic (to deduct tempRep)",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "requester";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "aiValidationRequest";
          docs: ["The new AI Validation Request account to be created"];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 105, 95, 114, 101, 113, 117, 101, 115, 116];
              },
              {
                kind: "account";
                path: "submissionTopicLink";
              },
              {
                kind: "arg";
                path: "expectedAiRequestIndex";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "tempRepToStake";
          type: "u64";
        },
        {
          name: "expectedAiRequestIndex";
          type: "u64";
        },
      ];
    },
    {
      name: "revealVote";
      docs: [
        "Instruction handler: Reveal a previously committed vote",
        "",
        "This reveals the actual vote choice and verifies it matches the previously committed hash.",
        "If valid, it adds the voter's voting power to the appropriate yes/no counter.",
      ];
      discriminator: [100, 157, 139, 17, 186, 75, 185, 149];
      accounts: [
        {
          name: "state";
        },
        {
          name: "submissionTopicLink";
          writable: true;
        },
        {
          name: "topic";
        },
        {
          name: "submission";
        },
        {
          name: "voteCommit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 111, 116, 101, 95, 99, 111, 109, 109, 105, 116];
              },
              {
                kind: "account";
                path: "submissionTopicLink";
              },
              {
                kind: "account";
                path: "validator";
              },
            ];
          };
        },
        {
          name: "userProfile";
          writable: true;
        },
        {
          name: "validator";
          docs: [
            "The validator revealing the vote (must match the original committer)",
          ];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "voteChoice";
          type: {
            defined: {
              name: "voteChoice";
            };
          };
        },
        {
          name: "nonce";
          type: "string";
        },
      ];
    },
    {
      name: "setVotingPhases";
      docs: [
        "Instruction handler: Set voting phases for a submission-topic link",
        "",
        "This allows the protocol authority to manually set timestamps for the commit and reveal phases.",
        "This is primarily intended for testing and administrative purposes.",
      ];
      discriminator: [47, 239, 173, 25, 48, 50, 89, 214];
      accounts: [
        {
          name: "state";
        },
        {
          name: "submissionTopicLink";
          writable: true;
        },
        {
          name: "topic";
        },
        {
          name: "submission";
        },
        {
          name: "authority";
          docs: ["Only authority can modify phases"];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "commitPhaseStart";
          type: {
            option: "u64";
          };
        },
        {
          name: "commitPhaseEnd";
          type: {
            option: "u64";
          };
        },
        {
          name: "revealPhaseStart";
          type: {
            option: "u64";
          };
        },
        {
          name: "revealPhaseEnd";
          type: {
            option: "u64";
          };
        },
      ];
    },
    {
      name: "stakeTopicSpecificTokens";
      docs: [
        "Instruction handler: Stake topic-specific temporary alignment tokens",
        "",
        "Burns tempAlign tokens from a specific topic and mints tempRep tokens for that topic",
      ];
      discriminator: [169, 70, 125, 159, 255, 227, 61, 183];
      accounts: [
        {
          name: "state";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "topic";
          docs: ["The topic for which tokens are being staked"];
        },
        {
          name: "userProfile";
          docs: ["The user's profile, contains references to token accounts"];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "userTopicBalance";
          docs: [
            "The user's topic-specific balance account for this topic.",
            "MUST be initialized separately via `initialize_user_topic_balance` first.",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "tempAlignMint";
          docs: ["The temporary alignment token mint (source tokens to burn)"];
          writable: true;
        },
        {
          name: "tempRepMint";
          docs: ["The temporary reputation token mint (target tokens to mint)"];
          writable: true;
        },
        {
          name: "userTempAlignAccount";
          docs: [
            "The protocol-owned tempAlign token account for this user (source for burn)",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  97,
                  108,
                  105,
                  103,
                  110,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "userTempRepAccount";
          docs: [
            "The protocol-owned tempRep token account for this user (target for mint)",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  114,
                  101,
                  112,
                ];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "user";
          docs: [
            "The user associated with these tokens, signing the transaction.",
          ];
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Token program for CPI calls"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "submitAiVote";
      docs: [
        "Instruction handler: Submit AI vote result (called by Oracle)",
        "",
        "Allows the authorized off-chain Oracle to submit the AI's decision, adding voting power.",
      ];
      discriminator: [14, 66, 50, 52, 152, 68, 247, 237];
      accounts: [
        {
          name: "oracle";
          writable: true;
          signer: true;
        },
        {
          name: "state";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "aiValidationRequest";
          docs: ["The AI Request being fulfilled."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 105, 95, 114, 101, 113, 117, 101, 115, 116];
              },
              {
                kind: "account";
                path: "submissionTopicLink";
              },
              {
                kind: "arg";
                path: "aiRequestIndex";
              },
            ];
          };
        },
        {
          name: "submissionTopicLink";
          docs: ["The SubmissionTopicLink being voted on."];
          writable: true;
        },
      ];
      args: [
        {
          name: "aiRequestIndex";
          type: "u64";
        },
        {
          name: "aiDecision";
          type: {
            defined: {
              name: "voteChoice";
            };
          };
        },
      ];
    },
    {
      name: "submitDataToTopic";
      docs: [
        "Instruction handler: Submit data to a specific topic",
        "",
        "This creates a submission and links it to a topic, setting up the voting phases.",
      ];
      discriminator: [174, 28, 180, 76, 104, 145, 137, 125];
      accounts: [
        {
          name: "state";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "topic";
          writable: true;
        },
        {
          name: "tempAlignMint";
          docs: [
            "The temporary alignment token mint, must be mutable for minting",
          ];
          writable: true;
        },
        {
          name: "contributorTempAlignAccount";
          docs: [
            "The protocol-owned tempAlign token account for this contributor",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  101,
                  109,
                  112,
                  95,
                  97,
                  108,
                  105,
                  103,
                  110,
                ];
              },
              {
                kind: "account";
                path: "contributor";
              },
            ];
          };
        },
        {
          name: "submission";
          docs: [
            "The new Submission account - Seeds now use user key + user counter index",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 117, 98, 109, 105, 115, 115, 105, 111, 110];
              },
              {
                kind: "account";
                path: "contributor";
              },
              {
                kind: "arg";
                path: "currentSubmissionIndex";
              },
            ];
          };
        },
        {
          name: "submissionTopicLink";
          docs: [
            "The link between submission and topic - Seeds use the derived submission key",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  108,
                  105,
                  110,
                  107,
                ];
              },
              {
                kind: "account";
                path: "submission";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "contributorProfile";
          docs: ["The contributor's user profile (must exist)"];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101,
                ];
              },
              {
                kind: "account";
                path: "contributor";
              },
            ];
          };
        },
        {
          name: "userTopicBalance";
          docs: [
            "The UserTopicBalance account for this contributor and topic.",
            "MUST be initialized separately via `initialize_user_topic_balance` first.",
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  116,
                  111,
                  112,
                  105,
                  99,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: "account";
                path: "contributor";
              },
              {
                kind: "account";
                path: "topic";
              },
            ];
          };
        },
        {
          name: "contributor";
          docs: ["The user making the submission"];
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "dataReference";
          type: "string";
        },
        {
          name: "currentSubmissionIndex";
          type: "u64";
        },
      ];
    },
    {
      name: "updateTokensToMint";
      docs: [
        "Instruction handler: update the number of tokens to mint for each submission",
      ];
      discriminator: [201, 55, 218, 24, 117, 145, 232, 0];
      accounts: [
        {
          name: "state";
          writable: true;
        },
        {
          name: "authority";
          writable: true;
          signer: true;
          relations: ["state"];
        },
      ];
      args: [
        {
          name: "newTokensToMint";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "aiValidationRequest";
      discriminator: [115, 20, 165, 104, 59, 191, 189, 63];
    },
    {
      name: "state";
      discriminator: [216, 146, 107, 94, 104, 75, 182, 177];
    },
    {
      name: "submission";
      discriminator: [58, 194, 159, 158, 75, 102, 178, 197];
    },
    {
      name: "submissionTopicLink";
      discriminator: [234, 173, 40, 145, 213, 135, 142, 162];
    },
    {
      name: "topic";
      discriminator: [181, 15, 35, 125, 85, 137, 67, 106];
    },
    {
      name: "userProfile";
      discriminator: [32, 37, 119, 205, 179, 180, 13, 194];
    },
    {
      name: "userTopicBalance";
      discriminator: [146, 221, 248, 104, 25, 6, 252, 84];
    },
    {
      name: "voteCommit";
      discriminator: [125, 216, 109, 1, 40, 87, 250, 47];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "invalidAuthority";
      msg: "Invalid authority for this state";
    },
    {
      code: 6001;
      name: "overflow";
      msg: "Arithmetic overflow occurred";
    },
    {
      code: 6002;
      name: "insufficientTokenBalance";
      msg: "Insufficient token balance for staking";
    },
    {
      code: 6003;
      name: "tokenMintMismatch";
      msg: "Token mint mismatch";
    },
    {
      code: 6004;
      name: "invalidTokenAccount";
      msg: "Invalid token account";
    },
    {
      code: 6005;
      name: "invalidUserProfile";
      msg: "Invalid user profile";
    },
    {
      code: 6006;
      name: "userProfileAlreadyInitialized";
      msg: "User profile already initialized";
    },
    {
      code: 6007;
      name: "zeroStakeAmount";
      msg: "Cannot stake zero tokens";
    },
    {
      code: 6008;
      name: "emptyTopicName";
      msg: "Topic name cannot be empty";
    },
    {
      code: 6009;
      name: "topicNameTooLong";
      msg: "Topic name exceeds maximum length";
    },
    {
      code: 6010;
      name: "topicDescriptionTooLong";
      msg: "Topic description exceeds maximum length";
    },
    {
      code: 6011;
      name: "topicInactive";
      msg: "Topic is inactive";
    },
    {
      code: 6012;
      name: "noActiveTopics";
      msg: "No active topics available for submission";
    },
    {
      code: 6013;
      name: "submissionAlreadyInTopic";
      msg: "Submission already exists in this topic";
    },
    {
      code: 6014;
      name: "notAuthorizedToLinkSubmission";
      msg: "Not authorized to link this submission";
    },
    {
      code: 6015;
      name: "voteAlreadyCommitted";
      msg: "Vote has already been committed";
    },
    {
      code: 6016;
      name: "voteAlreadyRevealed";
      msg: "Vote has already been revealed";
    },
    {
      code: 6017;
      name: "invalidVoteHash";
      msg: "Invalid vote hash";
    },
    {
      code: 6018;
      name: "noReputationForTopic";
      msg: "Validator has no reputation tokens for this topic";
    },
    {
      code: 6019;
      name: "submissionNotPending";
      msg: "Submission is not in the pending state";
    },
    {
      code: 6020;
      name: "insufficientVotingPower";
      msg: "Vote amount exceeds available reputation";
    },
    {
      code: 6021;
      name: "zeroVoteAmount";
      msg: "Vote amount must be greater than zero";
    },
    {
      code: 6022;
      name: "commitPhaseNotStarted";
      msg: "Commit phase has not started yet";
    },
    {
      code: 6023;
      name: "commitPhaseEnded";
      msg: "Commit phase has ended";
    },
    {
      code: 6024;
      name: "revealPhaseNotStarted";
      msg: "Reveal phase has not started yet";
    },
    {
      code: 6025;
      name: "revealPhaseEnded";
      msg: "Reveal phase has ended";
    },
    {
      code: 6026;
      name: "revealPhaseNotEnded";
      msg: "Reveal phase has not ended yet";
    },
    {
      code: 6027;
      name: "voteAlreadyFinalized";
      msg: "Vote has already been finalized";
    },
    {
      code: 6028;
      name: "insufficientTopicTokens";
      msg: "Insufficient topic-specific token balance";
    },
    {
      code: 6029;
      name: "invalidPhaseOrder";
      msg: "Invalid voting phase order";
    },
    {
      code: 6030;
      name: "selfVotingNotAllowed";
      msg: "Self-voting is not allowed: validators cannot vote on their own submissions";
    },
    {
      code: 6031;
      name: "duplicateVoteCommitment";
      msg: "You have already committed a vote for this submission-topic pair";
    },
    {
      code: 6032;
      name: "userAccountMismatch";
      msg: "The user account in the provided data does not match the expected user.";
    },
    {
      code: 6033;
      name: "invalidTopic";
      msg: "The provided topic account does not match the expected topic.";
    },
    {
      code: 6034;
      name: "incorrectSubmissionIndex";
      msg: "The provided submission index does not match the user's current submission count.";
    },
    {
      code: 6035;
      name: "dataReferenceTooLong";
      msg: "The data reference exceeds the maximum allowed length";
    },
    {
      code: 6036;
      name: "emptyDataReference";
      msg: "The data reference cannot be empty";
    },
    {
      code: 6037;
      name: "invalidSubmission";
      msg: "The provided submission does not match the expected submission.";
    },
    {
      code: 6038;
      name: "notSubmissionContributor";
      msg: "The signer is not the original contributor of the submission.";
    },
    {
      code: 6039;
      name: "insufficientTempRepBalance";
      msg: "Insufficient temporary reputation balance for AI validation request.";
    },
    {
      code: 6040;
      name: "unauthorizedOracle";
      msg: "The signer is not the authorized AI Oracle.";
    },
    {
      code: 6041;
      name: "invalidAiRequestStatus";
      msg: "The AI validation request is not in the expected state (e.g., not Pending).";
    },
    {
      code: 6042;
      name: "mismatchedAiRequestLink";
      msg: "The AI validation request account does not correspond to the provided SubmissionTopicLink.";
    },
    {
      code: 6043;
      name: "submissionAlreadyFinalized";
      msg: "This submission has already been finalized.";
    },
    {
      code: 6044;
      name: "stateMismatch";
      msg: "AI request index mismatch. State may have changed.";
    },
  ];
  types: [
    {
      name: "aiValidationRequest";
      docs: [
        "Account to track an AI validation request for a specific submission within a topic",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "submissionTopicLink";
            docs: ["Link to the submission being validated"];
            type: "pubkey";
          },
          {
            name: "requester";
            docs: [
              "User who requested the validation (the original contributor)",
            ];
            type: "pubkey";
          },
          {
            name: "tempRepStaked";
            docs: [
              "Amount of tempRep risked/spent by the user for this request",
            ];
            type: "u64";
          },
          {
            name: "requestTimestamp";
            docs: ["Timestamp of the request"];
            type: "u64";
          },
          {
            name: "status";
            docs: ["Status of the AI validation process"];
            type: {
              defined: {
                name: "aiValidationStatus";
              };
            };
          },
          {
            name: "aiDecision";
            docs: ["The AI's decision (populated upon completion)"];
            type: {
              option: {
                defined: {
                  name: "voteChoice";
                };
              };
            };
          },
          {
            name: "aiVotingPower";
            docs: [
              "The AI's voting power derived from temp_rep_staked (populated upon completion)",
            ];
            type: "u64";
          },
          {
            name: "requestIndex";
            docs: ["The index (from link counter) used for this request's PDA"];
            type: "u64";
          },
          {
            name: "bump";
            docs: ["Bump seed for the PDA"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "aiValidationStatus";
      docs: ["Status of an AI Validation Request"];
      type: {
        kind: "enum";
        variants: [
          {
            name: "pending";
          },
          {
            name: "processing";
          },
          {
            name: "completed";
          },
          {
            name: "failed";
          },
        ];
      };
    },
    {
      name: "state";
      docs: ["Global state account for this protocol"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "tempAlignMint";
            docs: [
              "The temporary alignment token mint (non-transferable until converted)",
            ];
            type: "pubkey";
          },
          {
            name: "alignMint";
            docs: ["The permanent alignment token mint (transferable)"];
            type: "pubkey";
          },
          {
            name: "tempRepMint";
            docs: ["The temporary reputation token mint (non-transferable)"];
            type: "pubkey";
          },
          {
            name: "repMint";
            docs: ["The permanent reputation token mint (non-transferable)"];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: ["The protocol authority (admin, DAO, etc.)"];
            type: "pubkey";
          },
          {
            name: "oraclePubkey";
            docs: ["The authorized public key for the AI Oracle service"];
            type: "pubkey";
          },
          {
            name: "bump";
            docs: ["Bump seed for the state PDA"];
            type: "u8";
          },
          {
            name: "topicCount";
            docs: ["Counts how many topics have been created"];
            type: "u64";
          },
          {
            name: "tokensToMint";
            docs: ["The number of tokens to mint for each submission"];
            type: "u64";
          },
          {
            name: "defaultCommitPhaseDuration";
            docs: ["Default duration for commit phase in seconds (24 hours)"];
            type: "u64";
          },
          {
            name: "defaultRevealPhaseDuration";
            docs: ["Default duration for reveal phase in seconds (24 hours)"];
            type: "u64";
          },
        ];
      };
    },
    {
      name: "submission";
      docs: ["Each submission entry"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "contributor";
            docs: ["The user who submitted the data"];
            type: "pubkey";
          },
          {
            name: "timestamp";
            docs: ["Unix timestamp of when they submitted"];
            type: "u64";
          },
          {
            name: "dataReference";
            docs: [
              "Arbitrary string to store data reference (IPFS hash, Arweave ID, etc.)",
            ];
            type: "string";
          },
          {
            name: "bump";
            docs: ["Bump seed for the submission PDA"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "submissionStatus";
      docs: ["Status of a submission"];
      type: {
        kind: "enum";
        variants: [
          {
            name: "pending";
          },
          {
            name: "accepted";
          },
          {
            name: "rejected";
          },
        ];
      };
    },
    {
      name: "submissionTopicLink";
      docs: ["Tracks the relationship between a submission and a topic"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "submission";
            docs: ["The submission this link refers to"];
            type: "pubkey";
          },
          {
            name: "topic";
            docs: ["The topic this link refers to"];
            type: "pubkey";
          },
          {
            name: "status";
            docs: ["Status of this submission within this specific topic"];
            type: {
              defined: {
                name: "submissionStatus";
              };
            };
          },
          {
            name: "commitPhaseStart";
            docs: ["Start timestamp for the commit phase"];
            type: "u64";
          },
          {
            name: "commitPhaseEnd";
            docs: ["End timestamp for the commit phase"];
            type: "u64";
          },
          {
            name: "revealPhaseStart";
            docs: ["Start timestamp for the reveal phase"];
            type: "u64";
          },
          {
            name: "revealPhaseEnd";
            docs: ["End timestamp for the reveal phase"];
            type: "u64";
          },
          {
            name: "yesVotingPower";
            docs: ["Total yes voting power received (quadratic)"];
            type: "u64";
          },
          {
            name: "noVotingPower";
            docs: ["Total no voting power received (quadratic)"];
            type: "u64";
          },
          {
            name: "totalCommittedVotes";
            docs: ["Total number of committed votes"];
            type: "u64";
          },
          {
            name: "totalRevealedVotes";
            docs: ["Total number of revealed votes"];
            type: "u64";
          },
          {
            name: "bump";
            docs: ["Bump seed for the link PDA"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "topic";
      docs: ["Topic/Corpus account for organizing submissions"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            docs: ["Name of the topic"];
            type: "string";
          },
          {
            name: "description";
            docs: ["Description of the topic"];
            type: "string";
          },
          {
            name: "authority";
            docs: ["Creator of the topic (authority or eventually DAO)"];
            type: "pubkey";
          },
          {
            name: "submissionCount";
            docs: ["Count of submissions in this topic"];
            type: "u64";
          },
          {
            name: "commitPhaseDuration";
            docs: ["Duration of the commit phase in seconds"];
            type: "u64";
          },
          {
            name: "revealPhaseDuration";
            docs: ["Duration of the reveal phase in seconds"];
            type: "u64";
          },
          {
            name: "isActive";
            docs: ["Whether the topic is active and accepting submissions"];
            type: "bool";
          },
          {
            name: "bump";
            docs: ["Bump seed for the topic PDA"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "userProfile";
      docs: ["User profile account to track reputation and submissions"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            docs: ["The user's wallet public key"];
            type: "pubkey";
          },
          {
            name: "userSubmissionCount";
            docs: ["A local submission counter for unique seeds"];
            type: "u64";
          },
          {
            name: "userTempAlignAccount";
            docs: [
              "References to the user's protocol-owned temporary token accounts",
            ];
            type: "pubkey";
          },
          {
            name: "userTempRepAccount";
            type: "pubkey";
          },
          {
            name: "userAlignAta";
            docs: [
              "(Optional) References to the user's permanent token Associated Token Accounts (ATAs)",
              "These might need separate instructions to initialize/update if used.",
            ];
            type: "pubkey";
          },
          {
            name: "userRepAta";
            type: "pubkey";
          },
          {
            name: "bump";
            docs: ["Bump seed for the user profile PDA"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "userTopicBalance";
      docs: ["Account to store user's token balances for a specific topic"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            docs: ["The user wallet this balance belongs to"];
            type: "pubkey";
          },
          {
            name: "topic";
            docs: ["The topic this balance is associated with"];
            type: "pubkey";
          },
          {
            name: "tempAlignAmount";
            docs: ["Amount of temporary alignment tokens for this topic"];
            type: "u64";
          },
          {
            name: "tempRepAmount";
            docs: [
              "Amount of temporary reputation tokens staked for this topic (available for voting)",
            ];
            type: "u64";
          },
          {
            name: "lockedTempRepAmount";
            docs: [
              "Amount of temporary reputation tokens locked in active votes for this topic",
            ];
            type: "u64";
          },
          {
            name: "bump";
            docs: ["Bump seed for the PDA"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "voteChoice";
      docs: ["Vote direction (Yes/No)"];
      type: {
        kind: "enum";
        variants: [
          {
            name: "yes";
          },
          {
            name: "no";
          },
        ];
      };
    },
    {
      name: "voteCommit";
      docs: [
        "Vote commit account - stores the hash of a user's vote during the commit phase",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "submissionTopicLink";
            docs: ["The link between submission and topic being voted on"];
            type: "pubkey";
          },
          {
            name: "validator";
            docs: ["The validator who created this vote commit"];
            type: "pubkey";
          },
          {
            name: "voteHash";
            docs: [
              "The hashed vote: SHA-256(validator pubkey + submission_topic_link pubkey + vote choice + nonce)",
            ];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "revealed";
            docs: ["Whether this vote has been revealed yet"];
            type: "bool";
          },
          {
            name: "finalized";
            docs: [
              "Whether this vote has been finalized (tokens converted or burned)",
            ];
            type: "bool";
          },
          {
            name: "voteChoice";
            docs: ["The revealed vote choice (only valid after reveal)"];
            type: {
              option: {
                defined: {
                  name: "voteChoice";
                };
              };
            };
          },
          {
            name: "commitTimestamp";
            docs: ["Commit timestamp"];
            type: "u64";
          },
          {
            name: "voteAmount";
            docs: [
              "The amount of tempRep or Rep tokens committed to this vote",
            ];
            type: "u64";
          },
          {
            name: "isPermanentRep";
            docs: [
              "Whether this is using permanent Rep (true) or temporary tempRep (false)",
            ];
            type: "bool";
          },
          {
            name: "bump";
            docs: ["Bump seed for the vote commit PDA"];
            type: "u8";
          },
        ];
      };
    },
  ];
};
