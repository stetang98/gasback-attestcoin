# BUIDL CTC 2026 Fall — verified competition brief

Observed on 2026-09-12. This file records research, not a completed entry.

## User constraints

- Deliver the entry today, 2026-09-12, Beijing time.
- Maximum external spending: RMB 50. Prefer free tools and test networks.
- User can provide approximately one hour of assistance today.
- Use Superpowers; prioritize a distinctive, functioning submission with verifiable evidence.
- No project code existed at the start. The repository had no commits or remote.

## Authoritative requirements

Sources:

1. https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail — read in the normal browser, including Rules and Requirements.
2. https://buidl.creditcoin.org/ — organizer website.
3. https://luma.com/buidlctc-fall26-ama — Creditcoin-cohosted kickoff.

- Deadline: September 13, 2026, 23:59 ET; September 14, 2026, 11:59 Asia/Shanghai. The browser's localized extended deadline agrees.
- Winners announced September 20, 2026.
- Prize pool: USD 15,000; first 10,000, second 3,000, third 2,000.
- Tracks: DeFi, RWA, DePIN, Gaming, AI.
- Minimum team size: one human member.
- Work must be original and created during the hackathon, deployed on a testnet, respect third-party IP, and use Attestcoin as a core feature.
- Functional Attestcoin integration code and technical setup/integration documentation are required.
- Depth of Attestcoin utilization is explicitly a core scoring criterion. No numerical rubric was present in the inspected official details.
- All team members must satisfy the organizer's criminal-record, sanctions, and applicable-law eligibility conditions. Eligibility cannot be certified by the assistant.
- Submitted information must be truthful; submitters must have rights to all submitted materials.
- No AI-specific prohibition or licensing mandate was present in the inspected detail text. This is an observation, not a guarantee that no other applicable rule exists.

## Submission checklist

- Project name, sector, description, Attestcoin integration summary.
- GitHub repository URL with README.
- Deck or whitepaper PDF URL.
- Prototype demonstration video URL.
- Logo optional.
- Each human member: first and last name, email, short bio, role, country of residence, citizenship.
- Telegram, X, LinkedIn, resume optional.
- DoraHacks registration is distinct from AMA registration.

## Current field

The DoraHacks BUIDLs tab showed 87 entries and 309 hackers. All four loaded batches of project summaries were inspected. Listing descriptions are participant claims, not independent audits.

Many entries describe credit passports, repayment reputation, invoice financing, and AI lending. Examples include Credit Passport, Miro Passport, AttestLend Passport, AttestFlow, Acoris, CrossCredit, AttestDesk, and LoomCredit.

Other occupied concepts include ProofGate (proof-gated AI actions), PRECEDENCE (collateral ordering), Singleton (duplicate pledges), ProofPay (payment solvers), AttestOps/Tutela (DePIN service settlement), ChargeProof (charging receipts), and ProofPerks (purchase cashback).

No inspected summary clearly described a sponsor-funded, cryptographically verified rebate specifically for reverted transactions. This does not establish global novelty or guarantee that another entry lacks that feature.

## Technical facts supporting the proposed direction

- Creditcoin testnet RPC: https://rpc.cc3-testnet.creditcoin.network ; EVM chain ID 102031.
- Ethereum Sepolia is supported with source chain key 1; source Ethereum mainnet uses key 3.
- Attestcoin verifier precompile: 0x0000000000000000000000000000000000000FD2.
- Official JavaScript SDK retains the name @gluwa/usc-sdk.
- Official ABI encoder includes transaction sender, destination, input, nonce, receipt status, gas used, and logs in the attested encoded transaction.
- A reverted transaction can therefore be differentiated from a successful transaction through proof-bound receipt status, subject to live proof/precompile verification.
- Proof-generation/attestation latency must be measured; an 8–10 minute settling interval is a planning estimate, not a promised demo latency.
- Cross-chain write-back is not assumed. The proposed flow ends with a Creditcoin-local state change/payout.

Technical sources:

- https://docs.creditcoin.org/environments/testnet
- https://github.com/gluwa/cc-next-query-builder/blob/main/src/encoding/abi/v1.ts
- https://github.com/gluwa/usc-testnet-bridge-examples

## Honest completion criteria

The entry is not complete until the live testnet deployment, real proof verification, target-chain outcome, public artifact links, and DoraHacks submission confirmation have each been observed. A local simulation or screenshot is not a substitute for a real transaction or submission receipt.
