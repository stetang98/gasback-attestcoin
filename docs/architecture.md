# GasBack architecture and Attestcoin integration

Review draft, 2026-09-12. This document describes implemented contract behavior and the integration pipeline. Evidence completeness is recorded separately in `integration/evidence/run.json`.

## Application outcome

A protocol can sponsor a fixed rebate when a preauthorized source-chain transaction reverts. The intended user outcome is a visible, self-service claim whose decision can be reproduced from source facts and immutable policy. User demand and willingness to fund campaigns remain product hypotheses; no adoption metrics are claimed.

## Components

```mermaid
sequenceDiagram
    participant S as Sponsor
    participant V as GasBackVault / Creditcoin testnet
    participant U as User / Sepolia
    participant A as Attestcoin attestation + proof builder
    participant R as Relayer or browser
    participant P as Native verifier 0xFD2
    S->>V: Fund vault, issue exact one-use ticket
    U->>U: Send eligible action; receipt status = 0
    U-->>A: Source transaction and receipt
    A-->>R: Encoded payload + Merkle/continuity proof
    R->>V: claim(ticketId, chainKey, headerNumber, payload, proof)
    V->>P: verify the submitted payload and source height
    P-->>V: true or revert
    V->>V: Decode verified bytes; check policy + replay
    V->>U: Pay fixed test-CTC rebate to stored beneficiary
```

| Component | Implementation | Trust role |
| --- | --- | --- |
| Source action | `chain/contracts/DemoAction.sol` | Reproducible `succeed(bytes32)` and intentional `fail(bytes32)` paths |
| Sponsor vault | `chain/contracts/GasBackVault.sol` | Owns campaign test assets and enforces immutable ticket policy |
| Native verifier | Creditcoin precompile `0x0000000000000000000000000000000000000FD2` | Checks inclusion and continuity against Creditcoin's attestation state |
| Decoder | `@gluwa/asc-contracts` 0.2.1 `EvmV1Decoder` | Decodes authenticated common transaction fields, type-2 fields and receipt |
| Proof pipeline | `integration/`, `@gluwa/usc-sdk` 0.18.0 | Acquires evidence, preflights native verification, submits target claim and exports receipts |
| Browser | `web/dist/` | Presents recorded/live evidence and pending/rejected states; has no server signing key |

The hosted proof builder is needed for convenient availability, not authorization. A fabricated response must fail the native verifier. The vault's verifier address cannot be replaced by its owner.

## Exact verification path

`claim` accepts the ticket ID plus `uint64 chainKey`, `uint64 headerNumber`, the encoded transaction, a Merkle proof and a continuity proof. The Merkle tuple is `(bytes32 root, (bytes32 hash, bool isLeft)[] siblings)`. Continuity is `(bytes32 lowerEndpointDigest, bytes32[] roots)`.

The contract first checks issued/unspent ticket state, target-chain deadline and chain key. It then calls:

```solidity
INativeQueryVerifier(VERIFIER).verify(
    chainKey, headerNumber, encodedTransaction, merkleProof, continuityProof
)
```

Only after a true result does it decode `encodedTransaction` with the official type-2 decoder. It requires:

- Source chain key `1` and decoded EVM chain ID `11155111`.
- `receiptStatus == 0`.
- Exact source sender, destination, nonce and calldata hash from the ticket.
- A non-creation transaction, native value zero and gas limit at least the ticket minimum.
- `minSourceBlock <= headerNumber <= maxSourceBlock`.
- `block.timestamp <= claimDeadline` on Creditcoin.

The final nullifier is `keccak256(abi.encode(chainKey, verifiedSender, verifiedNonce))`. A different proof path or ticket ID cannot bypass it. The contract checks available balance, marks the ticket and nullifier consumed, increments `totalPaid`, and transfers the fixed amount to the stored beneficiary. A reverted transfer reverts every state update. A guard prevents payment callbacks from entering another claim.

The successful app event is `RebatePaid(ticketId, nullifier, beneficiary, amount, sourceBlock)`. The chosen native `verify` method is read-only and does not emit `TransactionVerified`; the application event and the mined claim receipt are the target outcome evidence.

## What makes Attestcoin essential

GasBack acts on a remote receipt failure, including a reverted execution that has no successful application event to bridge. The authenticated envelope includes both transaction identity and receipt status. Creditcoin can therefore make the sponsorship decision from those facts without accepting an operator's statement that a transaction failed.

This is one source-chain proof followed by a Creditcoin-local payout. It does not assume a Creditcoin-to-Sepolia message, asset bridge, Ethereum storage proof, off-chain incident oracle, or proof of a revert reason. Removing Attestcoin removes the product's independent failure-verification step.

## Deployment and evidence lifecycle

The runbook creates a source deployment, a target deployment and ticket, then the matching source failure. The ticket must exist before the eligible action in the intended demo. Source nonce and exact calldata are fixed before the source transaction is sent.

After the failure is attested, the pipeline fetches a proof and performs a native read-only preflight. Tampering with the encoded receipt status must make native verification fail. The claim script submits the original proof, checks the mined result, application event and consumed state, and then checks duplicate rejection with `eth_call`. The duplicate check is not a second mined transaction.

Snapshot `2026-09-12T05:56:16.294Z` verifies only the source deployment:

- Sepolia contract: [`0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea`](https://sepolia.etherscan.io/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea).
- [Deployment transaction](https://sepolia.etherscan.io/tx/0x11c6cadadf3b945cda0b2cb4129e736932518cc7d042c83d67fbcb68c2676267), block `11686978`, receipt status `1`.
- Target deployment, ticket, eligible failure, native proof, claim and duplicate outcome: pending at this snapshot.

## Verification layers

1. **Contract policy tests:** 42 generated local cases use the real Solidity vault and official decoder. A test-only exact-tuple allowlist replaces the native verifier to isolate app policy.
2. **Native integration checks:** authentic proof and tampered proof checked against the actual Creditcoin precompile. A read-only check is not a payout.
3. **Mined app outcome:** target receipt, `RebatePaid`, consumed ticket/nullifier and payment evidence. This is required before claiming a completed rebate.
4. **Public delivery checks:** source repository, app, PDF, video and accepted DoraHacks entry must be accessible. These are separate from contract correctness.

No local fixture or historical feasibility probe satisfies layers 2-4 for this project. See [threat model](threat-model.md) and [contract review](research/contract-review.md).

## Official integration references

- [Attestcoin SDK guide](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk)
- [Creditcoin testnet configuration](https://docs.creditcoin.org/environments/testnet)
- [Official Solidity contracts](https://github.com/gluwa/asc-contracts)
- [Native verifier ABI](https://github.com/gluwa/creditcoin3/blob/usc-dev/precompiles/metadata/sol/block_prover.sol)
- [Official encoded transaction schema](https://github.com/gluwa/cc-next-query-builder/blob/main/src/encoding/abi/v1.ts)
