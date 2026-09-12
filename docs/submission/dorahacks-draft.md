# DoraHacks submission draft

Review draft, 2026-09-12. These fields require a final evidence refresh before submission. Do not replace pending items with invented URLs or claim a completed native payout until the corresponding receipts exist.

## Project name

GasBack

## Sector / track

DeFi

## One-line introduction

Sponsor-funded rebates for preauthorized reverted transactions, verified on Creditcoin through the Attestcoin Protocol.

## Project description

GasBack gives protocols a verifiable way to sponsor a fixed rebate when a preauthorized user transaction fails on another chain. A user should be able to show the failed transaction and check the sponsor's policy, without relying on a support agent to decide whether the failure happened.

A sponsor funds a Creditcoin vault and issues a one-use ticket binding the source sender, destination, nonce, exact calldata hash, minimum gas limit, source block window, beneficiary, deadline and rebate. The user performs the designated action on Ethereum Sepolia. A relayer obtains its Attestcoin proof; the vault independently verifies the encoded transaction and receipt before interpreting them. Only a failed receipt matching the ticket can release the fixed test-CTC amount.

The relayer cannot redirect payment. Replay protection binds the authenticated source chain, sender and nonce, so another ticket or proof cannot redeem the same transaction twice. Atomic payment and reentrancy controls keep claim state consistent.

This is a testnet sponsorship prototype. It does not prove fault, user innocence or economic damages, and does not promise full gas reimbursement. The demonstration deliberately reverts; exact tickets and bounded campaign funds constrain sponsor exposure.

Current evidence snapshot: the Sepolia source contract is deployed; the target deployment, prospective ticket, real native proof and rebate are pending verification. The local contract suite contains 42 policy/security cases using a disclosed verifier harness. Native verification and a mined rebate remain separate acceptance gates.

## Attestcoin integration summary

Attestcoin is the source of the fact that authorizes payment. `GasBackVault.claim` calls Creditcoin's fixed native verifier at `0x0000000000000000000000000000000000000FD2` with source chain key, source block height, encoded transaction, Merkle inclusion proof and continuity proof. The contract decodes only those same verified bytes with the official `@gluwa/asc-contracts` 0.2.1 `EvmV1Decoder`.

It accepts only Ethereum Sepolia (chain key 1, decoded chain ID 11155111), type-2 transactions, zero native value and receipt status zero. Verified sender, destination, nonce, calldata and gas limit must match an immutable sponsor ticket; the verified source height must lie inside its block range. Successful transactions, altered evidence, mismatched intent, expired tickets and consumed source identities cannot pay.

The proof runner uses the official `@gluwa/usc-sdk` 0.18.0 to obtain proof material, preflights the real native verifier, and exports public receipts and verification results. Payment takes place locally on Creditcoin testnet after verification; no cross-chain write-back or asset bridge is assumed. Removing Attestcoin removes the independent source-failure check and leaves only an operator's claim about remote execution.

## Differentiation

- A concrete user outcome: a bounded sponsor rebate following a proven failed transaction.
- Receipt failure is central, including reverted executions without successful application logs.
- Exact intent authorization limits which failures are sponsored; verification is not a blanket promise to pay arbitrary failed transactions.
- A judge can inspect the complete proof-to-policy-to-payment chain and adversarial rejections.

This is the project's positioning, not a claim of global novelty or superiority over unreviewed competitors. No users, partnerships, revenue or audit results are claimed.

## Artifact fields

| DoraHacks field | Review-draft value |
| --- | --- |
| GitHub URL | Pending repository creation and public-access check |
| Website | Expected URL: https://gasback-ctc-2026.jazzy-lamp-4850.chatgpt.site ; publication/public access pending verification |
| Deck / whitepaper PDF URL | Local `GasBack-deck.pdf` prepared; public PDF URL pending |
| Prototype video URL | Pending recording, publication and playback check |
| Logo | Optional; use an approved project asset if available |

## Final evidence to insert

- Source deployment and contract address: verified in `integration/evidence/source-deployment.json`.
- Creditcoin target deployment address and receipt: pending.
- Ticket issuance receipt before the eligible source action: pending.
- Eligible failed source transaction hash and status-0 receipt: pending.
- Native proof verification and altered-payload rejection: pending.
- Real claim hash, matching `RebatePaid`, consumed state and beneficiary payment: pending.
- Duplicate claim rejection, accurately labeled as read-only or mined: pending.
- Native successful-receipt rejection and required mismatches: pending.
- Public repository, app, PDF and video links checked from the judge's perspective: pending.

Replace the current-evidence paragraph with the verified final outcome only after these observations exist. Remove review-draft notices only after checking that every linked artifact agrees with the evidence manifest.

## Originality and tool disclosure

GasBack's application code and submission materials were created during the September 2026 hackathon period. The project directly imports official Gluwa Solidity libraries and the official SDK, and attributes external dependencies. Codex and Superpowers assisted engineering, planning and review. The participant must personally confirm authorship rights, accurate team details and organizer eligibility conditions. Do not list an AI assistant as a human team member or invent a professional audit.

## Human member fields

For every actual participant: first name, last name, email address, truthful short bio, project role, country of residence and citizenship. Telegram, X, LinkedIn and resume are optional. The participant must confirm the organizer's criminal-record/pending-case, sanctions and applicable-law conditions and complete required account authentication or declarations.

Source: [official competition details](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail), inspected on 2026-09-12. See [the verified competition brief](../research/2026-09-12-competition-brief.md).
