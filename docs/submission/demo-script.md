# GasBack demonstration script

Target runtime: approximately 110 seconds. English narration below may also be used as caption guidance. It describes the completed CLI testnet run, rechecked with the stricter verifier at 2026-09-12 07:04:13.308 UTC. The script is not a published video. The web recording must show read-only replay and verification, not imply that a replay button submits a new claim. The editable video has seven segments; its replacement narration is awaiting the participant's voice choice, and the revised final video has not been published.

## Recording prerequisites

- Use the completed `integration/evidence/run.json` and matching public receipt links.
- Show the actual ticket, failed source transaction and claim hashes; do not substitute the historical feasibility probe.
- Label the eight-minute attestation preparation interval when using a cut or replay.
- Keep private keys, seed phrases, account email and member contact fields out of the recording.
- Verify the final hosted video and PDF separately; their planned website paths do not establish publication.

| Time | Screen and action | English narration |
| --- | --- | --- |
| 0-10 s | App hero. On-screen: `Recorded CLI testnet run / read-only web replay`. | "GasBack pays a fixed sponsor rebate when an exact, preauthorized transaction fails. This is our completed testnet run, replayed in a read-only interface." |
| 10-25 s | Show the sponsor ticket and issuance receipt, Creditcoin block 5,473,617. | "The sponsor confirmed this ticket before the source action. It fixes the sender, destination, nonce, calldata hash, block window, beneficiary, and one test CTC rebate." |
| 25-40 s | Show Sepolia block 11,687,232, status 0, zero logs and the matching intent. | "The matching Sepolia transaction deliberately reverted: status zero, with zero logs. Attestcoin verifies the failed receipt itself, so a successful application event is unnecessary." |
| 40-59 s | Read-only native verification on recorded proof. Show `Observed attestation wait: 8m 54.575s / 15s polling`, then the recorded changed-status rejection. | "Attestation was first observed ready after eight minutes, fifty-five seconds. We show that elapsed wait. Creditcoin's native verifier accepted the proof and rejected a changed status byte." |
| 59-80 s | Real claim, Creditcoin block 5,473,655, status 1. Gross `1 test CTC`, net `0.9999184485`, gas `0.0000815515`; recorded CLI execution. | "The CLI submitted this real claim. The vault paid one test CTC. The beneficiary also paid claim gas, so its wallet increased by slightly less than one. The exact amounts are on screen." |
| 80-98 s | Read-only duplicate: `TicketAlreadyClaimed`. Wrong-chain/unissued-ticket results; separate `42 local policy/security cases`. | "A read-only repeat returns TicketAlreadyClaimed. Wrong-chain and unissued-ticket calls also fail. No second claim was mined. Broader policy and reentrancy cases are covered by forty-two local tests." |
| 98-110 s | Return to receipt links and public repository. | "The source, ticket, proof and paid receipt are linked for independent review. These are test assets. The web replay does not initiate a new payment." |

## Exact evidence for captions and links

- [Ticket receipt](https://creditcoin-testnet.blockscout.com/tx/0x261916243b9d6b4ab526e38a98337eac7f50e371561153939b35c668ed647ac1): target block timestamp 06:41:45 UTC; ticket confirmed before source broadcast.
- [Failed source receipt](https://sepolia.etherscan.io/tx/0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a): source block timestamp 06:42:00 UTC; status 0, zero logs, gas used 22,440.
- [Paid claim](https://creditcoin-testnet.blockscout.com/tx/0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035): gross 1 test CTC; block-boundary wallet net increase 0.9999184485 after claim gas 0.0000815515. Vault balance 10 -> 9.
- Source failure confirmation 06:42:05.151 UTC -> first attestation readiness observation 06:50:59.726 UTC: 8m 54.575s. Native verification finished 06:51:02.566 UTC: 8m 57.415s. Claim submitted 06:51:14.159 UTC -> receipt confirmed 06:51:19.220 UTC: 5.061s.

Timing values are local observations with 15-second attestation polling, not exact protocol publication timestamps or guarantees. Separate RPC block timestamps support the run's sequence; source UTC time is not part of the Attestcoin transaction encoding.

Changing receipt status 0 to 1 tests proof tampering. It is not a second authentic successful source transaction. The authentic-success rejection and other policy scenarios are local tests. All four live negative controls are `eth_call` checks, not mined rejected transactions.

## Final playback check

Watch the entire exported video. Confirm its claims match visible receipts, text and assets remain legible, no private fields appear, and the replay does not imply instantaneous attestation or new payment. Check public playback without an editor session before inserting the video URL into DoraHacks.
