# Independent frontend correctness review

Date: 2026-09-12. Scope: read-only review of `web/dist/app.js` and `web/dist/proof.js`.
No `web/` files were edited by the reviewer, no Sites calls were made, and no browser
or live-wallet operation was performed. This report is the reviewer's only change.

## Result at the reviewed snapshot

**No open P0–P2 finding remains in the final reviewed source.** Root repaired the
replay, wallet submission and recovery findings described below. This conclusion is
limited to source review and Node control-flow regression checks; it is not a claim
that a real wallet interaction or real target-chain payout has been tested.

Latest reviewed SHA-256:

- `app.js`: `D1C0ED605461B1786E52764893ABE2F16F189C463FA06C2A8C3240DD18CEA043`
- `proof.js`: `BE8C7CD0EB922711B74A7F838B923737B18A17738B6997B6BE568633420347C8`

Root edited concurrently during the review. The defects below describe earlier
snapshots and explicitly record their fixes. A later change should be checked
against its new file hash.

## Wallet findings repaired and rechecked

### P2 — A successfully accelerated claim is treated as a failed transaction

Location: `web/dist/app.js:68` (`tx.wait()` and the generic catch/finally path).

Trigger: submit a valid claim, then use the wallet's speed-up action with the same
sender, nonce, destination, calldata and value. The replacement mines successfully.
Ethers emits a `TRANSACTION_REPLACED` error with `reason: "repriced"`,
`cancelled: false`, the replacement transaction and its successful receipt. The
current catch renders a generic error and skips `verifyPayment`. Because `eligible`
is cleared only on the normal successful path, the finally block re-enables Claim
even though the ticket may already have been consumed and paid.

Impact: a normal wallet action produces a misleading failure state and leaves the
user with an enabled button for an already completed payment. The vault prevents a
second payout, but the page does not reconcile the real result.

Minimal fix: handle `TRANSACTION_REPLACED` separately. For a non-cancelled
replacement, compare its destination, calldata, value and chain to the captured
claim request, fetch/confirm its receipt through the fixed Creditcoin provider,
and run the same strict payment-identity checks. Display the replacement hash. A
cancelled or semantically different replacement must not be labeled paid.

Evidence: direct control-flow review plus the installed ethers implementation in
`chain/node_modules/ethers/lib.commonjs/providers/provider.js:1118`, which creates
this error for a same-call fee replacement. No live speed-up was attempted.

**Final status: fixed in source and exercised in a Node control-flow regression.**
Root now accepts a replacement only when not cancelled and when destination, sender,
calldata, value and nonce match the original transaction. It retrieves the final
receipt from the fixed Creditcoin provider, then performs payment identity checks.
An actual-app-function harness with a synthetic repriced transaction produced
`REBATE PAID`, kept Claim disabled and used the replacement receipt hash. The
observed send request included `chainId: 102031n`.

### P2 — A pending claim is not invalidated when the wallet changes network

Locations: `web/dist/app.js:68` and `web/dist/app.js:89` in the reviewed snapshot
(the latter is the `chainChanged` handler; locate by function if line numbers move).

Trigger: the initial `connect()` check confirms Creditcoin, the local `v` contract
is created, then the wallet changes chain while the static call, gas estimation or
wallet-send interaction is pending. The event handler clears the global `signer`,
but it does not invalidate the already captured contract/signer or abort this
claim operation. The later `v.claim(...args())` has no explicit chain ID override.

Impact: the app can continue a stale submission after the network event. Ethers
performs network checks during various RPC operations, which reduces the window,
but the application neither binds the transaction to Creditcoin nor rejects the
operation after its signer/network context changes. A late switch can result in
the wallet receiving the call on its newly selected chain. The intended value is
zero, but an unintended transaction can still consume gas.

Minimal fix: capture an immutable claim context and a wallet-context generation
counter. Increment the counter on `chainChanged`/`accountsChanged`, and abort the
pending operation if it changes before submission. Add `{ chainId: 102031n }` to
the actual claim transaction, check the wallet chain immediately before sending,
and obtain the final receipt from the fixed Creditcoin RPC. Continue to allow
relayers: the connected address does not have to be the beneficiary.

Evidence: code inspection. Ethers' `JsonRpcSigner.sendUncheckedTransaction` only
includes `chainId` when present in the supplied transaction and ultimately calls
`eth_sendTransaction`; see the installed primary implementation in
`chain/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:92` and its
RPC transaction serialization around line 534. No wrong-chain transaction was sent.

**Final status: fixed in source and exercised in a Node control-flow regression.**
Root increments `walletEpoch` on account/network changes, captures it after
connection, and checks it after simulation. The sent transaction explicitly binds
chain ID 102031. The regression injected a wallet-context change during simulation;
the actual `claim()` function made **zero send calls** and displayed its wallet-change
message. Real wallet handling of late chain changes remains a UI/integration test.

### P2 follow-up — RPC failure after broadcast could lose the known transaction hash

During re-review, the first recovery patch only disabled retry when the local
`hash = tx.hash` assignment had run. Ethers can broadcast successfully and then fail
while looking up the transaction, before returning a TransactionResponse. In that
case the known hash is attached to `error.info.sendTransactionHash`.

**Final status: fixed in source and exercised in a Node control-flow regression.**
Root now validates and adopts `error.info.sendTransactionHash` at the start of the
catch path. A synthetic post-broadcast network failure produced one send call,
`eligible: false`, a disabled Claim button, and the known Creditcoin transaction
link. The app requires fresh verification before retrying an uncertain submission.

## Findings fixed during this review

### P1 — Successful source proof could be presented as a completed failure rebate

Original locations: `app.js:43`, `app.js:73`, `app.js:79`.
Original app SHA-256: `B125B922289621564876A53A639884F0F9650BF73B4B536D6E2FDD83228ABD9B`.
Original proof SHA-256: `C897198EC0D3995DAF7A3808792127C583DC44B4D41B8FFAC264BF2E39761D61`.

`verify()` retained the authenticated proof for successful transactions and returned
early before `checkTicket`. `loadRun()` tested only whether a proof existed. Its
payment check matched ticket ID, beneficiary and source block, but not failed
status, source nonce/nullifier, exact ticket conditions or payout amount. A run
manifest accidentally or maliciously pairing a successful transaction with a real
failed transaction's payment could therefore pass when both source transactions
shared sender and block.

A read-only Node harness executed the actual app function bodies with synthetic
DOM and RPC boundaries, the real frontend decoder and real event ABI. Source
nonce 8/status 1 was paired with the recorded ticket/payment for nonce 7/status 0.
Observed output:

```json
{
  "receiptStatus": "REBATE PAID",
  "sourceState": "Succeeded · status 1",
  "ticketReads": 0,
  "notice": "Completed run verified: real failed source, native proof, and recorded sponsor payment. No new transaction was sent."
}
```

Root's fix now requires a failed source result in `loadRun`, retrieves the ticket
again during payment verification, and calls `assertPaymentIdentity`. That helper
checks full static ticket matching, failed status, exact nonce-based nullifier and
amount. Read-only assertions on the updated helper accepted a matching failure and
rejected success, another nonce, another nullifier and the wrong amount. The
reviewed fix closes this reproduced evidence-binding path. It does not retroactively
claim that a live payment was executed.

### P2 — Old replay completion overwrote newly entered evidence

Original location: `app.js:79`, following `verify`'s `finally { lock(false); }`.

After proof verification, `loadRun` awaited its recorded receipt with the inputs
unlocked. A user could edit an input and trigger `reset`; the old replay then used
the shared global proof/ticket variables and overwrote the new operation's notice.
A deferred-receipt Node reproduction observed editable inputs during that wait,
then `AWAITING EVIDENCE` paired with a stale payment-mismatch error after input reset.

Root's fix immediately locks the whole recorded-payment phase, disables Claim,
and releases the lock in the enclosing finally block. Because the continuation
relocks before another normal DOM event runs, the reproduced editable-input window
is closed. Passing explicit immutable verification snapshots would still make the
code easier to extend safely, but is not counted as an additional current defect.
The WebMCP entry point also checks `busy` before changing input values, so a
concurrent read-only tool invocation cannot replace the visible input during a claim.

## Final regression evidence

`node --test web/test/*.test.js`: **10 passed, 0 failed, 0 skipped**. This includes
four payment-identity regressions in `payment.test.js` and six proof tests.

An additional ephemeral Node harness executed the latest actual app function bodies
with controlled DOM, wallet-send and RPC boundaries, the real frontend helper module,
and the real vault event ABI. No application file was rewritten to run it.

| Scenario | Observed behavior |
| --- | --- |
| Same-call fee replacement mines | One send call; replacement receipt verified through fixed-provider boundary; paid state; Claim disabled |
| Wallet context changes during simulation | Zero send calls; wallet-change message |
| RPC fails after broadcast with `sendTransactionHash` | Known hash retained; eligibility cleared; Claim disabled |
| No injected wallet | Zero send calls; useful wallet-required message; read-only verification remains available |

These checks exercise the application's asynchronous control flow. The mocked
wallet/RPC boundaries do not establish wallet compatibility, public RPC availability,
cryptographic validity or a real testnet payout.

## Checked boundaries without an additional P0–P2 finding

- `verifyAttestedProof` awaits a strict `true` from the native verifier before
  decoding source fields. A rejection cannot authorize displayed verified data.
- Proof verification is fixed to Creditcoin testnet's native verifier. The source
  RPC comparison covers sender, target, nonce, calldata, value, gas limit, receipt
  status, gas used, source block and the RPC transaction's Sepolia chain ID.
- Fresh unclaimed-ticket eligibility uses a real vault `claim.staticCall`, so the
  contract remains authoritative for deadline, replay state, budget, source chain,
  transaction format and other policy conditions. Local predicates are not the
  sole authorization gate.
- The wallet flow explicitly requests/adds Creditcoin and confirms its chain ID
  after connection. Absence of `window.ethereum` produces a useful wallet-required
  message while preserving read-only verification; no additional no-wallet fix is
  required at this snapshot.
- Payout recipients come from the stored ticket. Allowing a different connected
  account as relayer is intentional and is not a beneficiary mismatch.
- The six proof tests and four payment tests all pass. Actual wallet/network behavior
  still requires the separate browser/integration check described above.
- Current `run.json` contains null source/claim/ticket/vault completion fields, so
  the page does not activate a falsely completed run from that unfinished manifest.

The browser historical-proof success was reported by root. This reviewer did not
repeat it. All synthetic tests described above isolate UI/control-flow correctness;
they do not substitute for native proof cryptography, real-wallet testing or a
testnet rebate receipt.
