# DoraHacks submission draft

Submission record, 2026-09-12. GitHub Pages is deployed with seven anonymous HTTP 200 checks and exact local/public hash matches. The live app verified the real proof, native verifier and linked 1.0 test CTC payment. DoraHacks confirmed [GasBack BUIDL 48594](https://dorahacks.io/buidl/48594) submitted to BUIDL CTC 2026 Fall and Under Review (not publicly visible yet), track DeFi. Submission receipt does not establish judging approval or an award. Personal eligibility is self-declared, not independently verified; future prize eligibility and payment remain unresolved.

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

The live testnet run is complete. The sponsor ticket confirmed before source broadcast; the matching Sepolia transaction reverted with status 0 and zero logs. The native Attestcoin verifier authenticated its receipt and identity, and the Creditcoin claim paid the fixed gross 1 test CTC rebate. Public RPC checks independently verified the event, consumed ticket, vault balance change from 10 to 9 and beneficiary transfer. Because the beneficiary also paid claim gas, its wallet net increase was 0.9999184485 test CTC after 0.0000815515 in gas.

Attestation readiness was first observed 8 minutes 54.575 seconds after source failure confirmation, using 15-second polling; native verification completed after 8 minutes 57.415 seconds. Claim submission to confirmation took 5.061 seconds. These are local observations for one run, not protocol latency guarantees. The CLI executed the transactions; the website provides read-only replay and verification of the linked run.

One dedicated test wallet filled the sponsor, source-sender and claimant roles in this demonstration. This verifies the technical path, not independent sponsor adoption.

Four live read-only negative controls rejected a changed receipt status, wrong source chain, unissued ticket and duplicate claim. There was no second mined claim. The 42-case local suite separately covers authentic successful receipts and other policy/security cases using a disclosed verifier harness; changing a status byte is not a separate authentic successful transaction.

Fresh review closed a P2 evidence-binding issue in the independent verification tooling. The corrected verifier links the source proof, historical sponsor ticket and vault-emitted payment event, with 16 regression tests and a fresh real-RPC check. No Critical or Important findings remain within the reviewed testnet code/evidence scope; this is not a professional security audit.

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

| DoraHacks field | Prepared value |
| --- | --- |
| GitHub URL | https://github.com/stetang98/gasback-attestcoin ; reviewed source and completed-run evidence publicly accessible |
| Website | https://stetang98.github.io/gasback-attestcoin/ ; deployed, live proof/native/payment UI verified |
| Deck / whitepaper PDF URL | https://stetang98.github.io/gasback-attestcoin/GasBack-deck.pdf ; HTTP 200 and exact local/public hash match |
| Prototype video URL | https://stetang98.github.io/gasback-attestcoin/demo.html ; submitted URL; V3 public file/hash checks passed, public V3 playback reached 110.08 s, ended=true and no media error |
| Logo | Required by the live Create new BUIDL Profile form: PNG/JPEG, under 2 MB; 480 x 480 pixels is the recommended size |
| Profile social links | At least one link is required by the live Profile form |

## Completed evidence, publication and draft-save state

- Source deployment and contract address: verified in `integration/evidence/source-deployment.json`.
- Target vault: [Creditcoin deployment](https://creditcoin-testnet.blockscout.com/tx/0x06c5a7072cabdd026c68b8f14412199f0c2b0f7e41859a03bcf2324339ff0127), status 1, block 5,473,616; 10 test CTC initial funds.
- Vault source: [fully verified in Blockscout](https://creditcoin-testnet.blockscout.com/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea?tab=contract); source verification is not a security audit.
- Ticket: [issuance receipt](https://creditcoin-testnet.blockscout.com/tx/0x261916243b9d6b4ab526e38a98337eac7f50e371561153939b35c668ed647ac1), status 1, block 5,473,617, confirmed before source broadcast.
- Source: [failed transaction](https://sepolia.etherscan.io/tx/0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a), status 0, zero logs, block 11,687,232.
- Native proof and changed-status rejection: verified in `integration/evidence/proof-verification.json`; tampered status reverted with `Merkle proof validation failed`.
- Payment: [mined claim](https://creditcoin-testnet.blockscout.com/tx/0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035), status 1, block 5,473,655; matching `RebatePaid`, consumed ticket and gas-adjusted beneficiary balance checked independently.
- Duplicate: read-only `TicketAlreadyClaimed`; no second mined claim, totalPaid remains 1 test CTC.
- Wrong chain and unissued ticket: read-only `WrongSourceChain` and `TicketNotIssued` before claim. Authentic successful-receipt rejection remains a local test rather than a separate live transaction.
- Published app: https://stetang98.github.io/gasback-attestcoin/ . Seven anonymous HTTP 200 responses and local/public hash matches cover demo.html, demo.mp4, demo.srt, GasBack-deck.pdf and the run, source-proof and reviewed-verification JSON files. The live UI verified the real proof/native/payment and displayed REBATE PAID, 1.0 test CTC and blocked replay.
- Public repository contains reviewed source and completed-run evidence. The V3 MP4 is 12,121,489 bytes with SHA-256 `d20a94b87b962702367f379bfb23bd2fcd8240f0ec42b6bd8c6b982556041c1c`; the PDF is 12,205 bytes with SHA-256 `c5e06b0efea9bfbd4af766ee25e72c8e52a289310855c32ec67bd15326717aee`. Both public files match local release files.
- Peter V3 public playback completed with currentTime=duration=110.08 s, ended=true, paused=true, readyState=4 and error=null; currentSrc identified demo.mp4?v=peter-v3. The Peter narration retains seven aligned clips and 24 caption cards, with original audio muted. Full human listening acceptance is not recorded.
- Profile, Details, Team and Contact have been restored with the new GitHub Pages website/media URLs; every step returned `Saved successfully`. Details contain the completed run and current video/PDF/GitHub/chain links.
- DoraHacks confirmed BUIDL Submitted! and that GasBack is now Under Review (not publicly visible yet) for BUIDL CTC 2026 Fall. [Entry 48594](https://dorahacks.io/buidl/48594) is on the DeFi track and can be edited before judging. Personal eligibility is self-declared, without independent verification. No private contacts, judging approval or prize entitlement are claimed.

Current GitHub Pages file/hash and live app checks passed, and DoraHacks submission receipt is confirmed. Peter V3 public playback reached 110.08 s with ended=true and no media error. Future prize-payment clarification remains separate; the inquiry is only an unsent private draft. Ticket/source block timestamps independently observed by RPC were 06:41:45 and 06:42:00 UTC; the Attestcoin transaction encoding itself does not prove a source UTC timestamp. The earlier historical probe must not replace this run.

## Originality and tool disclosure

GasBack's application code and submission materials were created during the September 2026 hackathon period. The project directly imports official Gluwa Solidity libraries and the official SDK, and attributes external dependencies. AI-assisted workflows supported engineering, planning and review. The participant supplied team information and self-declared compliance with the organizer's eligibility and submission-rights requirements; this is not independent verification. Do not list an AI assistant as a human team member or invent a professional audit.

## Human member fields

For every actual participant, the published competition requirements request first name, last name, email address, truthful short bio, project role, country of residence and citizenship. The participant has supplied basic identity information and is signed in to DoraHacks. Personal contact values belong in the required form fields, not in this public document.

The observed Create new BUIDL flow was **Profile -> Details -> Team -> Contact -> Submission**. The required logo and social link, privately supplied primary/backup contacts, and final required fields were filled; GitHub Pages URLs were saved. Submission receipt is confirmed at https://dorahacks.io/buidl/48594 with status Under Review (not publicly visible yet). Do not request the supplied contacts again or publish their account values.

This differs from the published competition description, which calls Telegram optional. Follow the actual required form fields to complete this submission; retain the distinction rather than representing the live form as optional. X, LinkedIn and resume remain optional under the published description; the form's at-least-one-link requirement still applies.

The participant explicitly self-declared compliance with the previously listed organizer eligibility conditions, while asking for clarification of the restrictions; an explanation was subsequently provided. That statement is recorded as a personal self-declaration, not independent verification or proof of a later repeated confirmation. The existing authorization and declaration remain the basis for the free project submission; no repeated declaration is requested solely because future prize-payment terms are unresolved.

The final Submission Terms of Use Agreement, clause 4, restricts BUIDL-related financial transactions for citizens of the People's Republic of China and countries subject to OFAC sanctions. It does not directly prohibit this free technical project submission. The separate donation clause restricts making grant donations, while optional Hackathon Prize Safe provisions describe third-party prize-fund handling. Future prize eligibility, actual payment methods and application of the financial clause to the advertised USD-denominated awards remain unresolved. No financial transaction is initiated by this submission, and no legal guarantee or right to receive a prize is claimed.

Sources: [official competition details](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail), inspected on 2026-09-12, and the signed-in Create new BUIDL form observed by the project owner on the same date. See [the verified competition brief](../research/2026-09-12-competition-brief.md). No separate external registration form has been established by those observations.
