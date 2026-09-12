# GasBack contracts

Testnet-only, sponsor-funded fixed rebates for preauthorized reverted Sepolia transactions.
This package has no deployment credentials and performs no live transactions.

## Reproduce

```powershell
cd chain
pnpm.cmd install --frozen-lockfile
pnpm.cmd test
pnpm.cmd compile
```

Node 24 and pnpm 11 are supported by the checked run. Ganache uses its JavaScript
transport explicitly, because its bundled native transport does not support Node 24.
The transport notice is expected. No RPC server or listening port is opened.
Optional native WebSocket accelerators are explicitly disabled in `pnpm-workspace.yaml`.

Compilation uses pinned solc 0.8.28, optimizer 200 runs, via IR and Paris EVM.
The exported `artifacts/GasBackVault.json` and `artifacts/DemoAction.json` contain ABI,
creation bytecode, deployed bytecode template and compiler metadata. The vault's
deployed bytecode template has an immutable owner placeholder; use a normal
constructor deployment, not a direct runtime-bytecode installation.

## Trusted boundary

`GasBackVault` calls the fixed native verifier at
`0x0000000000000000000000000000000000000FD2` before decoding any source fields.
It imports `INativeQueryVerifier` and `EvmV1Decoder` directly from the pinned official
`@gluwa/asc-contracts` 0.2.1 package. No owner function can replace the verifier.

Only chain key **1**, decoded source chain ID **11155111**, transaction type **2**,
receipt status **0**, and native transaction value **0** are supported. Other
transaction types and malformed encodings fail closed.

The sponsor issues an immutable ticket with these ordered fields:

```text
address beneficiary
address sourceSender
address sourceTarget
uint64  sourceNonce
uint64  minSourceBlock
uint64  maxSourceBlock
uint64  claimDeadline
uint64  minGasLimit
uint256 rebate
bytes32 calldataHash
```

`beneficiary` must equal `sourceSender`. Calldata is bound by `keccak256` of the exact
transaction input, including selector and parameters. The source block range is
inclusive and is checked against the verifier-bound header number. Claim expiry is
checked against Creditcoin's timestamp and is inclusive at `claimDeadline`.
Minimum source gas refers to the transaction gas **limit**, not gas used.

The sponsor should issue a ticket before the source action and choose a future source
block range. This contract cannot translate Creditcoin issuance time into an attested
Sepolia timestamp. Sponsor authorization remains a trusted policy decision.

Anyone can relay `claim`; payout always uses the stored beneficiary. Replay protection
is `keccak256(abi.encode(uint64 chainKey, address verifiedSender, uint64 verifiedNonce))`.
It is independent of proof path and any user-supplied transaction hash. Payment,
ticket consumption and replay consumption are atomic; payment failure rolls back all
three. Reentry into another claim is rejected.

## Integration

`constructor()` is payable and sets `owner = msg.sender`. Additional direct funding
is accepted only from the owner. `issueTicket(bytes32 ticketId, Ticket ticket)` is
owner-only; an issued ID cannot be overwritten, cancelled or reassigned.

```text
claim(
  bytes32 ticketId,
  uint64 chainKey,
  uint64 headerNumber,
  bytes encodedTransaction,
  (bytes32 root, (bytes32 hash, bool isLeft)[] siblings) merkleProof,
  (bytes32 lowerEndpointDigest, bytes32[] roots) continuityProof
)
```

Use the exported JSON ABI for machine integration. Successful claims emit:

```text
RebatePaid(bytes32 indexed ticketId, bytes32 indexed nullifier,
           address indexed beneficiary, uint256 amount, uint64 sourceBlock)
```

The demo supports `succeed(bytes32 intent)` and `fail(bytes32 intent)`. The failure
function is `pure`, so ethers requires an explicit send to create a mined transaction:

```js
const failure = await demo.fail.send(intent, {
  type: 2, nonce: expectedSourceNonce, value: 0, gasLimit: 100000,
});
try { await failure.wait(); } catch (error) {
  // A mined status-0 receipt is the intended demo outcome.
  if (!error.receipt || error.receipt.status !== 0) throw error;
}
```

## Limits

- Tests execute the real vault, official Solidity decoder and source action in an
  in-memory EVM. A test-only exact-tuple allowlist is installed at the verifier
  address to isolate policy. It does **not** implement cryptographic inclusion or
  continuity verification. Live native verification is a separate integration gate.
- Tickets do not reserve funds. Claims pay only while sufficient sponsor budget is
  present; a rejected underfunded claim can be retried after owner funding.
- This minimal testnet campaign has no owner withdrawal, upgrade, cancellation,
  arbitrary-chain support or full gas-cost accounting. Fund only the intended demo
  amount; unclaimed excess funds remain in the vault.
- A user can deliberately revert. A proof establishes transaction facts, not fault,
  innocence, economic damage or entitlement beyond the sponsor's bounded ticket.
