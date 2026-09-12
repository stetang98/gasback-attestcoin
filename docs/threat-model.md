# GasBack threat model

Review draft for the testnet MVP, 2026-09-12. The protected asset is the sponsor-funded vault balance; the required property is that only an issued, unconsumed ticket matching an authenticated failed transaction can pay its fixed beneficiary once.

## Actors and assumptions

The sponsor owns the vault and chooses ticket eligibility. Users and relayers can submit arbitrary data and may deliberately cause failed transactions. The proof builder and browser are not authorities for receipt status or payout destination. Creditcoin consensus, its Attestcoin attestation state, the native verifier and the pinned official encoding are trusted infrastructure. This prototype does not independently audit their cryptography or economics.

Only Ethereum Sepolia source key 1 and Creditcoin testnet 102031 are in scope. Normal EOA identity is the supported cross-chain beneficiary model. A source contract account at one address does not by itself establish control of a contract at that address on another chain.

## Attacks and controls

| Attack or failure | Implemented control | Evidence / remaining boundary |
| --- | --- | --- |
| Invent or alter a failed receipt | Native proof verification before decoding any payout inputs | Local harness tests isolate binding; authentic native integration is a separate gate |
| Use a valid successful transaction | Require authenticated receipt status exactly zero | Policy tests cover status 1 and invalid status 2 |
| Swap sender, destination, nonce, calldata, value or chain | Exact ticket comparisons, zero value, fixed source key and decoded chain ID | Wrong-field cases fail without consuming the ticket |
| Use a contract creation or unsupported transaction type | Reject creation; official decoder accepts only type 2 for this call | Type-2-only and zero-value restriction are deliberate MVP scope |
| Replay one source transaction using another ticket or proof | Nullifier based on authenticated chain key, sender and nonce | Does not rely on caller-supplied transaction hash or Merkle path identity |
| Front-run a claim to redirect payment | Relayer cannot set beneficiary or rebate | A competing relay may complete the same user's payment; it cannot steal the rebate |
| Reenter another claim during payment | Global claim reentrancy guard; state changes precede transfer | Payment callback tests try another otherwise eligible ticket |
| Recipient rejects payment | Failed call reverts ticket, nullifier and accounting changes | Retry after recipient accepts is covered locally |
| Campaign has insufficient funds | Balance check before consumption; no partial payment | Tickets do not reserve funds and are not an unconditional payment guarantee |
| Change a issued ticket to seize or enlarge a claim | Owner-only issuance; ticket ID can never be overwritten | Sponsor chooses new tickets but cannot change an issued ID |
| Redeem stale or out-of-window evidence | Inclusive source block range plus Creditcoin claim deadline | Source UTC timestamp is not an authenticated field |
| Manufacture a technically valid but deliberate failure | Sponsor preauthorizes exact intent; one claim per transaction/ticket; fixed funded budget | This bounds exposure; it does not establish fault or prevent every Sybil strategy |
| Proof service outage or delayed attestation | Preserve pending states, retry evidence acquisition, preflight before spending claim gas | Availability and latency are external dependencies; no instant-finality claim |
| Browser or RPC presents misleading status | Keep public transaction links and raw evidence; authoritative vault checks stay on-chain | A malicious RPC may mislead the UI; independently inspect a trusted explorer/RPC |
| Leak a signing key in public artifacts | Dedicated test wallet, file outside repository, sanitized public evidence | Review exported files before publication; human account credentials are never submission content |

## Authorization and economic limits

The contract cannot derive source time from Creditcoin ticket issuance time. The intended run creates the ticket before the source action and chooses a future source block range. The sponsor's prospective policy is checked operationally through recorded issuance/action order, not through a fabricated attested source timestamp.

Minimum gas limit does not equal gas spent, successful execution effort, or economic loss. Even an exact calldata/nonce ticket can sponsor a deliberate revert. The payout is a fixed test-CTC subsidy; there is no ETH/CTC price oracle, insurance premium, fault adjudication, promise of full gas reimbursement, or automatic reimbursement of arbitrary failed transactions.

This MVP has no withdrawal, cancellation, ownership transfer, upgrade or reserved-balance mechanism. Unclaimed surplus can remain in the vault permanently. Use only the intended faucet-funded test amount. Broad commercial deployment would require new policy, accounting, operations and independent security work rather than assuming the demo is production-ready.

## Evidence labels

- **Local policy test:** actual local EVM execution with an allowlist verifier harness. It is not a cryptographic native proof test.
- **Native verification:** a real read-only call to the Creditcoin verifier. It establishes no mined rebate by itself.
- **Rebate paid:** a successful mined vault claim with matching event and state/payment evidence.
- **Duplicate rejected:** a read-only rejection unless a separately identified mined rejection receipt exists.
- **Historical probe:** technical feasibility from somebody else's earlier transaction. It must never be presented as this project's source action or payout.
- **Pending:** evidence has not been obtained. It is not a successful zero-value result.

The independent source review in [contract-review.md](research/contract-review.md) found no actionable P0-P2 defect at commit `eb31caa`. It is a bounded code review, not a professional audit or a completed live-integration certificate.
