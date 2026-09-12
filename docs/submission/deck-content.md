# GasBack - six-page English deck content

Testnet evidence edition. Run completed at 2026-09-12T06:51:34.633Z; reviewed public RPC re-verification passed at 07:04:13.308Z. GitHub Pages file/hash and live app checks passed. GasBack BUIDL 48594 is submitted and Under Review (not publicly visible yet); judging approval and an award are not claimed. Editable PDF builder: `create_deck.py`.

## 1. Prove the failure. Claim the sponsor rebate.

GasBack is a fixed sponsor rebate for preauthorized reverted transactions.

**Failed on Sepolia -> Verified by Attestcoin -> Rebated on Creditcoin**

Primary track: DeFi / BUIDL CTC 2026 Fall. Testnet assets only.

Completed evidence: a ticket confirmed before source broadcast, a real status-0 source receipt with zero logs, native proof verification and a mined fixed 1 test CTC rebate.

## 2. A precise job for a sponsorship budget

User job: show an eligible failed transaction and claim a known rebate.

Sponsor job: authorize exact intent and cap the campaign's payout exposure.

Current alternatives require a protocol-specific support decision or an operator's interpretation of source-chain data. GasBack makes its own policy and evidence inspectable.

Product hypothesis: sponsored recovery can improve onboarding for participating protocols. Demand, retention impact and willingness to fund campaigns are not yet validated.

Boundaries: no insurance, no full gas reimbursement, no assertion of fault.

## 3. Attestcoin is in the payment path

1. Sponsor issues an immutable ticket before the action.
2. Sepolia produces a genuine failed receipt.
3. A relayer acquires encoded transaction plus inclusion/continuity proof.
4. Creditcoin native verifier 0xFD2 authenticates the payload and source height.
5. GasBack checks receipt status zero and every ticket condition, then pays once.

Protocol removed = independent remote-failure check removed.

Policy: sender / destination / nonce / calldata hash / minimum gas limit / source block range / fixed beneficiary / fixed rebate / claim deadline.

## 4. A claim that can survive hostile inputs

Live native negative control: changing the encoded receipt status from 0 to 1 was rejected with `Merkle proof validation failed`.

Live read-only policy controls: wrong chain -> `WrongSourceChain`; unissued ticket -> `TicketNotIssued`; duplicate -> `TicketAlreadyClaimed`. No second mined claim occurred.

Local policy/security tests additionally cover authentic successful receipts, wrong intent, reused source identity, redirected payment, transfer failure and reentry. The status-tampering control is not a separate authenticated successful source transaction.

The beneficiary is fixed by the ticket; the nullifier binds verified source chain, sender and nonce.

Atomic rollback and a claim guard protect payment state.

42 local policy/security cases; disclosed verifier harness. A bounded independent code review found no actionable P0-P2 defect at eb31caa. This is not a professional audit or native-integration certificate.

Post-run review note: a separate P2 in independent evidence-verification tooling was fixed and independently re-reviewed. 16 verifier regressions, 42 contract tests and 10 web tests passed, with a new live RPC/native recheck. No Critical/Important findings remain within the reviewed testnet code/evidence scope. The PDF's transaction facts and amounts remain unchanged.

## 5. Evidence you can inspect

Ticket: Creditcoin block 5,473,617, status 1, confirmed before source broadcast. https://creditcoin-testnet.blockscout.com/tx/0x261916243b9d6b4ab526e38a98337eac7f50e371561153939b35c668ed647ac1

Source failure: Sepolia block 11,687,232, receipt status 0, zero logs, gas used 22,440. https://sepolia.etherscan.io/tx/0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a

Claim: Creditcoin block 5,473,655, status 1. Gross fixed rebate 1 test CTC; beneficiary net increase 0.9999184485 after claim gas 0.0000815515. Vault balance 10 -> 9, totalPaid 1; block-boundary balance and public RPC re-verification passed. https://creditcoin-testnet.blockscout.com/tx/0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035

Timing: source failure confirmation to first observed attestation readiness 8 min 54.575 s; native verification 8 min 57.415 s; claim submission to confirmation 5.061 s. The 15-second polling interval makes these local observations, not exact protocol publication times or guarantees. Independent block timestamps place ticket at 06:41:45 UTC and source failure at 06:42:00 UTC; source UTC time is not encoded in the proof.

Execution boundary: CLI executed the real transactions. The website is a read-only evidence replay and verification surface; no replay button initiated this claim. The earlier historical probe is separate.

Public app: https://stetang98.github.io/gasback-attestcoin/ . Seven release files passed anonymous HTTP 200 and exact local/public hash checks; the app verified the real proof/native/payment and displayed REBATE PAID, 1.0 test CTC and blocked replay. Public source: https://github.com/stetang98/gasback-attestcoin . DoraHacks entry: https://dorahacks.io/buidl/48594 — submitted to BUIDL CTC 2026 Fall, DeFi, Under Review (not publicly visible yet). Current V3 public playback completed at 110.08 s with ended=true, readyState=4 and no media error; full human listening acceptance is not recorded. Self-declared eligibility is not independently verified, and future prize eligibility/payment remain unresolved.

## 6. A small product with a measurable next step

First intended users: protocols experimenting with bounded onboarding or retry sponsorship.

Pilot proposal: one protocol, one action, a fixed test campaign budget and a clear eligibility rule.

Measure: native-proof availability/latency, eligible claim completion, rejection causes, sponsor spend and user retry behavior. These are proposed measures, not reported results.

Next gate: publish the completed run's synchronized artifacts and demonstration, then validate demand with one sponsor before expanding scope. One successful testnet run establishes technical feasibility, not adoption or production readiness.

No claimed traction, partners, revenue, or guaranteed awards. Participant details must remain truthful and eligibility requires the participant's own informed declaration.
