# GasBack demonstration script

Target runtime: approximately 110 seconds. English voiceover is supplied as text; no audio generation or publication has occurred. Record this sequence only after the corresponding live evidence exists. If a step remains pending, show it as pending and do not use the successful line.

## Recording prerequisites

- Use the final public app and the final evidence manifest.
- Confirm sponsor ticket issuance precedes the eligible source action.
- Have source and target explorers open at the actual transaction links.
- Complete slow attestation preparation first. Keep timestamps and label any cut as elapsed preparation time.
- Do not expose private keys, wallet seed phrases, account email, personal member fields or local secret-file contents.
- Never substitute the earlier historical feasibility probe for this project's failed action or payout.

| Time | Screen and action | English narration |
| --- | --- | --- |
| 0-12 s | GasBack first screen. Show `testnet` and the three-stage flow. | "A failed transaction should not require a support ticket. GasBack lets a protocol sponsor a fixed rebate, paid only after the failure is independently verified." |
| 12-29 s | Show the sponsor ticket: exact sender, destination, nonce, input hash, block window and rebate. Open ticket issuance receipt briefly. | "The sponsor authorizes this exact transaction intent before the user acts. The ticket fixes who gets paid, the rebate, and the claim window. It is not an open promise to reimburse every failure." |
| 29-44 s | Open the matching Sepolia transaction receipt. Show status 0 and the real contract. | "Here is our actual Sepolia transaction. The demo deliberately reverts, so this is a reproducible failed receipt. The proof establishes the failure, not who was at fault." |
| 44-63 s | Show native verification and proof-bound policy fields. On-screen: `Recorded live testnet run` and actual preparation interval. | "After attestation, the relayer obtains a proof. Creditcoin verifies it through the native Attestcoin precompile. The vault then reads those same verified bytes and checks every sponsor-policy condition." |
| 63-82 s | Open the real Creditcoin claim receipt. Show status 1, `RebatePaid`, beneficiary, amount and consumed ticket. | "The matching failed transaction receives the fixed sponsor rebate in test CTC. This is the mined claim receipt. A relayer may submit the proof, but cannot change the beneficiary or the amount." |
| 82-99 s | Run the read-only duplicate check and display its rejection. Show recorded tampered-proof and successful-receipt rejection results if available. | "Trying the same claim again is rejected. Altering the verified payload also fails. A successful source transaction cannot satisfy the vault's failed-receipt policy." |
| 99-110 s | Return to project page, show source/target links and repository link. | "GasBack turns a remote failed receipt into a bounded, inspectable sponsorship decision. The source, proof, policy and payment evidence are available for review. All assets shown are test assets." |

The successful-receipt line requires its own observed rejection evidence. Omit it if only the local test exists, or label the supporting screen explicitly as a local policy test. The duplicate check is an `eth_call` unless a separate mined rejection receipt is recorded; do not imply it spent gas.

## On-screen text

- `Ethereum Sepolia -> Attestcoin -> Creditcoin testnet`
- `Fixed sponsor rebate - not full gas reimbursement`
- `Native proof verified` only after the real native check succeeds.
- `Recorded live testnet run` when showing stored evidence rather than a new transaction.
- `Attestation preparation: [actual measured interval]` only after the interval is measured. Before then, write `Attestation time: pending measurement`.
- `Duplicate claim: rejected by read-only call` when using the current integration script.

## Honest fallback while integration is incomplete

Do not record the pending state as a finished hackathon demo. A progress walkthrough may show the source deployment, code, tests and pending stages, with this line: "The source contract is deployed. The target proof and rebate are still being verified; no completed rebate is claimed in this draft."

## Final playback check

Play the exported video from beginning to end. Verify that the narration matches visible evidence, addresses and assets remain legible, no private fields appear, and no waiting cut implies instantaneous attestation. Open the final public video URL without relying on an editor session before adding it to DoraHacks.
