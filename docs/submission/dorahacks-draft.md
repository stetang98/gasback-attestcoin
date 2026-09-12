# DoraHacks submission draft

Review draft, 2026-09-12. Updated with the public-site verification and the live DoraHacks creation form observed in the participant's signed-in session. The entry has not been confirmed submitted. These fields require a final project-evidence refresh before submission; do not claim a completed native payout until the corresponding receipts exist.

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

Current project evidence: the Sepolia source contract is deployed and the public app is available. A historical proof has been successfully verified through the online app; it is a feasibility demonstration, not this project's rebate. The target deployment, prospective ticket, proof for this project's eligible failure and mined rebate are still pending verification. The local contract suite contains 42 policy/security cases using a disclosed verifier harness. Native verification and a mined rebate remain separate acceptance gates.

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
| GitHub URL | https://github.com/stetang98/gasback-attestcoin ; public API and key raw source verified on 2026-09-12 at main commit `4c5a0a19cbc7049f3cf68a8d7c4e0750602d8f17` (98 published file paths and hashes matched) |
| Website | https://gasback-ctc-2026.stetang.chatgpt.site ; deployed with the participant's authorization and independently returned HTTP 200 without account cookies on 2026-09-12 |
| Deck / whitepaper PDF URL | [Public review draft in repository](https://github.com/stetang98/gasback-attestcoin/blob/main/docs/submission/GasBack-deck.pdf); final prospective-run refresh pending |
| Prototype video URL | Pending recording, publication and playback check |
| Logo | Required by the live Create new BUIDL Profile form: PNG/JPEG, under 2 MB; 480 x 480 pixels is the recommended size |
| Profile social links | At least one link is required by the live Profile form |

## Final evidence to insert

- Source deployment and contract address: verified in `integration/evidence/source-deployment.json`.
- Creditcoin target deployment address and receipt: pending.
- Ticket issuance receipt before the eligible source action: pending.
- Eligible failed source transaction hash and status-0 receipt: pending.
- Native proof verification and altered-payload rejection: pending.
- Real claim hash, matching `RebatePaid`, consumed state and beneficiary payment: pending.
- Duplicate claim rejection, accurately labeled as read-only or mined: pending.
- Native successful-receipt rejection and required mismatches: pending.
- Public app access: verified without account cookies at https://gasback-ctc-2026.stetang.chatgpt.site .
- Public repository: verified at https://github.com/stetang98/gasback-attestcoin ; main commit `4c5a0a19cbc7049f3cf68a8d7c4e0750602d8f17`.
- Public review PDF is in the repository; final prospective-run refresh pending.
- Public video, recording and playback check: pending.
- DoraHacks accepted-submission confirmation and actual BUIDL URL: pending; account login is not submission.

Replace the current-evidence paragraph with the verified final outcome only after these observations exist. Remove review-draft notices only after checking that every linked artifact agrees with the evidence manifest.

## Originality and tool disclosure

GasBack's application code and submission materials were created during the September 2026 hackathon period. The project directly imports official Gluwa Solidity libraries and the official SDK, and attributes external dependencies. Codex and Superpowers assisted engineering, planning and review. The participant must personally confirm authorship rights, accurate team details and organizer eligibility conditions. Do not list an AI assistant as a human team member or invent a professional audit.

## Human member fields

For every actual participant, the published competition requirements request first name, last name, email address, truthful short bio, project role, country of residence and citizenship. The participant has supplied basic identity information and is signed in to DoraHacks. Personal contact values belong in the required form fields, not in this public document.

The live Create new BUIDL flow observed on 2026-09-12 is **Profile -> Details -> Team -> Contact**. The Profile step marks the logo as required and requires at least one social link. The Contact step requires **Telegram as the primary contact**, and offers Discord, WhatsApp or WeChat for the backup channel. The Telegram value has been requested from the participant. Do not substitute another person's contact or invent a handle.

This differs from the published competition description, which calls Telegram optional. Follow the actual required form fields to complete this submission; retain the distinction rather than representing the live form as optional. X, LinkedIn and resume remain optional under the published description; the form's at-least-one-link requirement still applies.

The participant must understand and truthfully confirm the organizer's criminal-record/pending-case, sanctions and applicable-law conditions and the rights to the submitted materials. A statement made before those restrictions were explained must not be silently treated as informed confirmation. No personal eligibility declaration has been inferred or published in this draft.

Sources: [official competition details](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail), inspected on 2026-09-12, and the signed-in Create new BUIDL form observed by the project owner on the same date. See [the verified competition brief](../research/2026-09-12-competition-brief.md). No separate external registration form has been established by those observations.
