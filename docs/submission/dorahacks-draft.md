# DoraHacks submission draft

Submission copy, 2026-09-12. Refreshed against `integration/evidence/run.json` (`completed-live-testnet-rebate`, 06:51:34.633 UTC) and the stricter reviewed public RPC verification (07:04:13.308 UTC). Final media and evidence are publicly deployed with seven anonymous HTTP 200 checks and canonical media/evidence hash matches. DoraHacks Details and the Profile demo-video URL are saved, but the entry has not been submitted.

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
| Website | https://gasback-ctc-2026.stetang.chatgpt.site ; final Sites version deployed with completed-run evidence and Peter V2 media |
| Deck / whitepaper PDF URL | https://gasback-ctc-2026.stetang.chatgpt.site/GasBack-deck.pdf ; anonymous HTTP 200, exact local/public SHA-256 match |
| Prototype video URL | https://gasback-ctc-2026.stetang.chatgpt.site/demo.html ; entered in Profile Demo video and saved successfully. MP4 and corrected SRT are public; public browser playback reached 110.08 s with `ended=true` and no error |
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
- Final public app is deployed at https://gasback-ctc-2026.stetang.chatgpt.site . Seven anonymous HTTP 200 checks cover `/demo.html`, `/demo.mp4`, `/demo.srt`, `/GasBack-deck.pdf`, `/evidence/run.json`, `/evidence/source-proof.json` and `/evidence/public-reverification-reviewed.json`.
- Public repository contains reviewed source and completed-run evidence. The public PDF, Peter V2 MP4 and three evidence JSON files exactly match the canonical local hashes; the subtitle sidecar uses the correct Attestcoin spelling.
- Peter V2 uses seven aligned narration clips and 24 caption cards, with the old audio muted. Local and public playback reached 110.08 s with `ended=true` and no media error; public playback reported `readyState=4`. The public session paused at 98.78 s and then resumed to the ending. Full human listening acceptance is not recorded.
- The Details field was replaced with the completed run and video/PDF/GitHub/chain links; Continue showed `Saved successfully`. The Profile Demo video field was set to the public `/demo.html` page and saved successfully.
- The entry remains unsubmitted. Primary Telegram and informed eligibility confirmation are outstanding; no accepted BUIDL URL is claimed.

Public files now agree with the completed evidence manifest and public playback has reached the ending successfully. Final submission remains outstanding. Ticket/source block timestamps independently observed by RPC were 06:41:45 and 06:42:00 UTC; the Attestcoin transaction encoding itself does not prove a source UTC timestamp. The earlier historical probe must not replace this run's linked transactions.

## Originality and tool disclosure

GasBack's application code and submission materials were created during the September 2026 hackathon period. The project directly imports official Gluwa Solidity libraries and the official SDK, and attributes external dependencies. Codex and Superpowers assisted engineering, planning and review. The participant must personally confirm authorship rights, accurate team details and organizer eligibility conditions. Do not list an AI assistant as a human team member or invent a professional audit.

## Human member fields

For every actual participant, the published competition requirements request first name, last name, email address, truthful short bio, project role, country of residence and citizenship. The participant has supplied basic identity information and is signed in to DoraHacks. Personal contact values belong in the required form fields, not in this public document.

The live Create new BUIDL flow observed on 2026-09-12 is **Profile -> Details -> Team -> Contact**. The Profile step marks the logo as required and requires at least one social link. The Contact step requires **Telegram as the primary contact**, and offers Discord, WhatsApp or WeChat for the backup channel. The Telegram value has been requested from the participant. Do not substitute another person's contact or invent a handle.

This differs from the published competition description, which calls Telegram optional. Follow the actual required form fields to complete this submission; retain the distinction rather than representing the live form as optional. X, LinkedIn and resume remain optional under the published description; the form's at-least-one-link requirement still applies.

The participant must understand and truthfully confirm the organizer's criminal-record/pending-case, sanctions and applicable-law conditions and the rights to the submitted materials. A statement made before those restrictions were explained must not be silently treated as informed confirmation. No personal eligibility declaration has been inferred or published in this draft.

Sources: [official competition details](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail), inspected on 2026-09-12, and the signed-in Create new BUIDL form observed by the project owner on the same date. See [the verified competition brief](../research/2026-09-12-competition-brief.md). No separate external registration form has been established by those observations.
