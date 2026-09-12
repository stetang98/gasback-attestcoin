# GasBack — proposed hackathon design

Status: selected for implementation after the user delegated the final choice on 2026-09-12, requesting the fastest credible route to a competitive entry. Implementation and submission remain to be completed.

## Outcome and positioning

GasBack lets a protocol sponsor a fixed rebate for an eligible user's reverted transaction on another chain. Creditcoin pays only after Attestcoin proves the source transaction really failed and all sponsor-policy conditions match.

Pitch: **A failed transaction should not require a support ticket. Prove the failure. Claim the sponsor rebate.**

Primary track: DeFi. A capped sponsorship program is the product; no insurance product, automatic fiat conversion, or guarantee of full gas-cost reimbursement is claimed. The demonstration uses test assets only.

## Why this direction

The protocol is necessary to independently determine receipt failure and transaction identity on Creditcoin. A frontend status label or operator-supplied JSON cannot authorize payment. The demo makes the proof boundary visible: a genuine failure can qualify, while a success, altered proof, mismatched transaction, and repeated claim cannot.

Alternatives considered:

| Direction | Strength | Reason not preferred today |
| --- | --- | --- |
| GasBack | Native receipt-status verification; clear consumer pain; small complete flow | Must validate failed-transaction proofs and prevent subsidy farming |
| Cross-chain credit passport | Familiar ecosystem alignment | Many visible submissions already implement it; little differentiation |
| DePIN uptime compensation | Strong real-world story | Requires an external service-truth authority and overlaps existing entries |

This is a strategic judgment based on inspected entries and published rules, not an estimated winning probability.

## Roles and scope

- Sponsor: funds a campaign, sets a fixed rebate, and authorizes a bounded ticket for a source sender/transaction intent.
- User: submits an eligible source transaction and claims a rebate with its proof.
- Relayer: obtains publicly verifiable evidence and submits it; cannot change beneficiary or payout.
- Judge: can reproduce the proof checks and inspect both-chain receipts without needing a funded wallet.

One source chain (Sepolia), one target chain (Creditcoin testnet), one demonstration source contract, one campaign. No token launch, mainnet deployment, token price oracle, premium collection, or arbitrary-chain support.

## End-to-end flow

1. Sponsor funds a Creditcoin campaign and authorizes one bounded ticket with fixed beneficiary/rebate, source sender, allowed contract, exact intent binding, and expiry.
2. The user performs a designated Sepolia action. The demo contract supports one reproducible success path and one reproducible reverted path.
3. The proof runner waits for source finality and Attestcoin attestation, obtains the real encoded transaction and proof, and performs a read-only preflight verification.
4. Creditcoin contract calls the native verifier and decodes only the proof-bound payload.
5. Contract checks failed receipt status, source chain, sender, target, intent/nonce binding, policy expiry, ticket state, available campaign balance, and transaction replay protection.
6. It marks the ticket/transaction consumed and pays the fixed subsidy to the stored beneficiary, atomically.
7. UI shows immutable source and target explorer links, policy conditions, claim result, and amount in test CTC.

Ticket binding uses source sender, destination, nonce, exact calldata hash, minimum gas limit, and an inclusive source block range. Claim expiry uses Creditcoin block.timestamp. No unproven source UTC timestamp, caller-supplied receipt, or claimed sender may authorize a payout. A source transaction timestamp is not present in the attested transaction encoding.

## Architecture

- `contracts/`: demonstration source action, sponsor-funded claim contract, proof-bound payload decoder/interface, and focused security tests.
- `scripts/`: deploy, create demo fixtures, wait for attestation, generate proof, verify, claim, and export public evidence. Signing material stays outside tracked/public files.
- `app/`: small polished responsive dashboard with campaign summary, claim flow, evidence inspector, and explicitly labeled replay/demo view.
- `docs/`: integration guide, threat model, deployment/evidence manifest, submission copy, PDF deck, and video script.

The UI and proof runner use the same versioned contract ABI and evidence schema. Public evidence contains chain IDs, contract addresses, transaction hashes, proof inputs, and observed outcomes; never private keys.

## Visual and demonstration design

A restrained dark dashboard with an amber failure state and a teal verified-rebate state. Three steps: **Failed on Sepolia → Verified by Attestcoin → Rebated on Creditcoin**. Every amount includes its asset and testnet label.

The decisive demo is approximately 90–150 seconds: show failed source receipt; show verified failure and policy checks; show rebate receipt; attempt duplicate claim; show the duplicate is rejected. Attestation waits are honestly labeled as elapsed preparation time, not edited to imply instantaneous finality.

A judge can inspect a completed live run immediately, and optionally start a new wallet-driven run. A recorded fixture must be labeled as a replay of the referenced live transactions, never presented as a newly executed claim.

## Required rejection cases

- Tampered encoded transaction/proof.
- Valid proof for a successful transaction.
- Wrong source chain, sender, destination, or intent/nonce.
- Reused transaction or ticket.
- Expired/unissued ticket and insufficient campaign funds.
- Reentrant payment recipient or payout failure: state must remain consistent.

## What the proof does and does not establish

It establishes the attested source transaction and its receipt status. It does not establish user innocence, a frontend bug, off-chain downtime, economic damages, or entitlement beyond the sponsor's policy. A user can deliberately revert; eligibility tickets, a fixed payout, one claim, campaign limits, and explicit sponsor authorization bound that risk. The project does not describe these controls as perfect Sybil prevention.

## Acceptance checklist

- [x] User delegates project selection and authorizes immediate completion under the stated constraints.
- [x] A historical failed Sepolia transaction passes Attestcoin precompile verification; changing its receipt status invalidates the proof. This is a feasibility check, not a project deployment or rebate.
- [ ] Source and target contracts deployed on the documented testnets.
- [ ] Real eligible failure produces a real target-chain rebate receipt.
- [ ] Success, tampering, mismatch, and replay rejection are verified.
- [ ] Contract tests and production frontend build pass.
- [ ] Desktop/mobile claim and evidence views are inspected.
- [ ] README reproduces setup and explains why Attestcoin is essential.
- [ ] Public code, live demo, PDF, and video links are accessible.
- [ ] Human team information is accurate and provided by the user.
- [ ] DoraHacks submission is accepted and the resulting entry link is checked.

## Time and budget

Target completion: today, 2026-09-12. External spending cap: RMB 50; planned spending RMB 0 using test faucets, free hosting, and existing local tooling. The 50 RMB cap is not permission for an unrequested subscription or mainnet funding.

Use the user's one-hour availability for the smallest necessary set of account, faucet, wallet, identity, and final-submission actions. Exact interventions depend on the observed account and faucet state.

Stop claims of readiness if real proof generation, faucet funding, public hosting, or account submission remains unavailable. Preserve finished artifacts and report the specific missing step rather than replacing it with fabricated evidence.
