# GasBack - six-page English deck content

Review draft. Evidence snapshot: 2026-09-12T05:56:16.294Z. Editable PDF builder: `create_deck.py`. Final publication requires replacing pending states with actual verified evidence, not unverified promises.

## 1. Prove the failure. Claim the sponsor rebate.

GasBack is a fixed sponsor rebate for preauthorized reverted transactions.

**Failed on Sepolia -> Verified by Attestcoin -> Rebated on Creditcoin**

Primary track: DeFi / BUIDL CTC 2026 Fall. Testnet assets only.

Current evidence: source contract deployed; complete target proof and rebate pending.

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

Tampered evidence: native verification must reject it.

Success or wrong intent: receipt and ticket checks reject it.

Reused transaction: sender + nonce + chain nullifier rejects it.

Redirected payout: beneficiary is fixed by the ticket.

Failed transfer or reentry: atomic rollback and a claim guard protect state.

42 local policy/security cases; disclosed verifier harness. A bounded independent code review found no actionable P0-P2 defect at eb31caa. This is not a professional audit or native-integration certificate.

## 5. Evidence you can inspect

Verified source deployment: Sepolia block 11,686,978, receipt status 1.

Source contract: 0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea.

Pending at this snapshot: target deployment; prospective ticket and eligible failure; native proof and tampering rejection; mined rebate and duplicate rejection.

App expected URL: https://gasback-ctc-2026.jazzy-lamp-4850.chatgpt.site . Publication/public access pending verification.

GitHub, public PDF and demo video URLs: pending. No complete rebate or accepted submission is claimed.

## 6. A small product with a measurable next step

First intended users: protocols experimenting with bounded onboarding or retry sponsorship.

Pilot proposal: one protocol, one action, a fixed test campaign budget and a clear eligibility rule.

Measure: native-proof availability/latency, eligible claim completion, rejection causes, sponsor spend and user retry behavior. These are proposed measures, not reported results.

Next gate: complete the live proof-to-payment run and publish reproducible evidence. Then validate demand with a sponsor before expanding scope.

No claimed traction, partners, revenue, or guaranteed awards. Human team identity and biography are pending participant input.
