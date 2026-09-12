# Final code review — GasBack testnet

Date: 2026-09-12

**Verdict: ready to publish within the reviewed testnet code and evidence scope. No Critical or Important findings remain open from this review.**

This records an independent code review, the initially discovered P2 issue, and a focused re-review after its repair. It does not certify production safety, audit Creditcoin's native verifier, or approve the final submission's identity, media, hosting, or account steps.

## Scope and review method

The requested initial range was `5c15cfeee60a54957dcb01ff96398ade236ccdbd` to `3ccf935a5cd432286cfd47979a0de21354c18a0c`, together with current web working-tree changes. The subsequent re-review covered the evidence-verifier repair in the working tree.

Reviewed implementation: `chain/contracts`, `chain/test`, `integration/*.cjs`, `web/dist/app.js`, `web/dist/proof.js`, `web/test`, and the current demo navigation/evidence wiring. Requirements came from `docs/superpowers/specs/2026-09-12-gasback-design.md` and the implementation context. Submission documents and video packaging were separately owned.

Inspection and verification were read-only: no source, evidence, Git index, HEAD, or branch changes were made by the reviewer. The original reproducer and the independent live verification intercepted output in memory. This report was subsequently written at the coordinator's explicit request.

## Strengths

- The vault invokes the fixed native verifier before decoding source facts, then enforces failed status, source chain, sender, target, nonce, calldata, minimum gas, zero value, source block interval, deadline and funded fixed rebate.
- Ticket consumption and the source nullifier prevent duplicate payment. Recipient and amount come from the stored ticket. Effects precede the external payment; rejected payments roll back state, and claim reentrancy is guarded.
- Browser payment verification checks the vault emitter and binds its event to the verified source and stored ticket, including nullifier, beneficiary, amount and source block.
- In-memory compilation of the reviewed `GasBackVault` and `DemoAction` sources matched their checked-in artifact bytecode. The browser's vault ABI matched the contract artifact. A targeted scan of tracked files found no literal signing-key candidates; private wallet files were not read.

## Initial Important finding — P2, now closed

**Original location:** `integration/verify-public.cjs`, lines 21–24 before the repair.

The public verifier checked source proof versus source RPC data separately from payment event versus manifest data. It did not connect that source to the stored ticket, event nullifier or event source block. Event parsing also accepted the same event signature without checking the emitting contract address.

A stale or substituted source transaction/proof could therefore borrow an existing genuine payment. Keeping the paid ticket, claim receipt, beneficiary and balance observations while replacing the source with another valid failed transaction could incorrectly produce `targetPayoutConfirmed: true`.

The reviewer reproduced this through the original script in an in-memory VM: the accepted source fixture used nonce **101**, while the retained ticket used nonce **1**. The script still reported both `targetPayoutConfirmed: true` and `duplicateRejected: true`. Native verification and source RPC responses were stubbed to represent separately accepted evidence. This demonstrated a missing application-level connection; it did **not** demonstrate fabrication of a native cryptographic proof. No evidence files were changed.

### Repair and focused re-review

The repair adds [public-evidence.cjs](../../integration/public-evidence.cjs), updates [verify-public.cjs](../../integration/verify-public.cjs), and adds [regression tests](../../integration/test/verify-public.test.cjs).

The repaired path:

1. Requires native acceptance before decoding; validates type-2 encoding, Sepolia chain ID, failed status and source policy, and reconstructs the signed source transaction hash.
2. Checks the source transaction and receipt against the linked hash, decoded identity, block and gas observations.
3. Reads the stored ticket, issuance, consumption, source-nullifier state and owner at the claim block, then connects them to the manifest and decoded source policy.
4. Accepts `RebatePaid` and `TicketIssued` only from the configured vault and checks their ticket, beneficiary and amount fields. Payment additionally binds the source nullifier and block.
5. Retains balance reconciliation and the read-only duplicate-claim rejection check. New report files use exclusive creation; the original run, proof and public-verification evidence are preserved.

The reviewer read the repair and independently ran its regression suite. A separately signed, unrelated type-2 source fixture with matching source RPC/proof fixtures is now rejected. Foreign emitters, changed event identities, altered policy fields and native rejection are also covered. **The original P2 is closed.**

## Independently observed validation

| Working directory | Command | Result |
| --- | --- | --- |
| `chain` | `node --test --test-concurrency=1 test/gasback.test.cjs` | 42 passed, 0 failed |
| `web` | `node --test test/*.test.js` | 10 passed, 0 failed |
| Repository root | `node --test integration/test/verify-public.test.cjs` | 16 passed, 0 failed |

The contract and web suites passed during the initial review. The repair did not change those source paths; the focused integration suite was rerun after the repair. Contract tests use a native-verifier harness and do not independently establish the precompile's cryptographic correctness.

The reviewer also executed the repaired verifier against actual Sepolia and Creditcoin testnet RPC endpoints and the native verifier. Only its file output was intercepted in memory; no wallet was used, no transaction was submitted, and no file was written. The independent run returned true for native verification, source/ticket/payment binding, vault emitters, ticket issuance, source consumption, beneficiary balance reconciliation and duplicate rejection.

The implementer's separately persisted [reviewed RPC evidence](../../integration/evidence/public-reverification-reviewed.json), observed at `2026-09-12T07:04:13.308Z`, records the same successful checks for:

- Source: `0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a`
- Claim: `0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035`
- Ticket: `0xdaaed6547b94010737043af2c46808f9090c1aa80ff3b1b518e27acad07a9cd5`
- Gross rebate: `1000000000000000000` wei, or **1 test CTC**.
- Beneficiary net increase: `999918448500000000` wei after the beneficiary's claim gas of `81551500000000` wei.

The duplicate check is an `eth_call` returning `TicketAlreadyClaimed`; it is not a second mined claim transaction. Cross-chain timestamps remain separate RPC observations, not timestamps authenticated inside the source transaction encoding.

## Remaining boundaries

No Critical or Important findings remain open in the reviewed scope. This is a bounded testnet prototype review, not a guarantee that all defects have been found. It depends on the native verifier and RPC infrastructure. Sponsor tickets do not reserve campaign funds, and deliberate failures remain possible under the sponsor's policy. The payout is a fixed subsidy in test assets, not insurance, a full gas refund, or proof of user fault or economic damages.

Sharing the vault-emitter helper with the older claim-recording script is possible follow-up hardening. It is not a blocker for this fixed EOA demonstration, whose final evidence passed the repaired independent verifier. Final publication and submission artifacts still require their separately assigned checks.
