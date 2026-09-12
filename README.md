# GasBack

**A failed transaction should not require a support ticket. Prove the failure. Claim the sponsor rebate.**

GasBack is a sponsor-funded, fixed rebate for a preauthorized reverted transaction on another chain. A Creditcoin smart contract uses the Attestcoin Protocol to verify the source transaction and its failed receipt, checks the sponsor's exact ticket policy, and pays the fixed amount to the verified sender.

Built for [BUIDL CTC 2026 Fall](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail), primary track **DeFi**. All deployments and amounts in this prototype use **test assets**. This is a capped sponsorship program, not insurance or a promise to reimburse the full gas cost.

## Current evidence

**A real prospective testnet run paid the fixed 1 test CTC rebate.** [The machine-readable run](integration/evidence/run.json) reached `completed-live-testnet-rebate` at `2026-09-12T06:51:34.633Z`. [Reviewed public RPC re-verification](integration/evidence/public-reverification-reviewed.json) at `07:04:13.308Z` confirmed the native proof, source-to-ticket-to-payment binding, event issuers, consumed state and gas-adjusted beneficiary transfer. The original check remains preserved separately.

| Item | Status |
| --- | --- |
| Solidity contracts and 42 policy/security test cases | Implemented; see [contract package](chain/README.md) and [independent source review](docs/research/contract-review.md) |
| Frontend and 10 proof/payment identity tests | Implemented; see [frontend review](docs/research/frontend-review.md) |
| Independent verification tooling | 16 regression tests passed after closing the evidence-binding P2; [fresh review](docs/qa/final-code-review.md) found no remaining Critical/Important findings within the reviewed testnet code and evidence scope |
| Sepolia source deployment | Receipt status 1, block 11,686,978; [deployment transaction](https://sepolia.etherscan.io/tx/0x11c6cadadf3b945cda0b2cb4129e736932518cc7d042c83d67fbcb68c2676267) |
| Source contract | [`0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea`](https://sepolia.etherscan.io/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea) |
| Creditcoin vault | [Deployment](https://creditcoin-testnet.blockscout.com/tx/0x06c5a7072cabdd026c68b8f14412199f0c2b0f7e41859a03bcf2324339ff0127), block 5,473,616, status 1; funded with 10 test CTC |
| Publicly verified vault source | [Blockscout contract source](https://creditcoin-testnet.blockscout.com/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea?tab=contract), fully verified; [verification result](integration/evidence/blockscout-verification-result.json) |
| Prospective sponsor ticket | [Ticket issuance](https://creditcoin-testnet.blockscout.com/tx/0x261916243b9d6b4ab526e38a98337eac7f50e371561153939b35c668ed647ac1), block 5,473,617; confirmed before source transaction broadcast |
| Eligible source failure | [Sepolia transaction](https://sepolia.etherscan.io/tx/0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a), block 11,687,232; status 0, zero logs, gas used 22,440 |
| Native Attestcoin verification | Real `0xFD2` verification passed for this source transaction; changing the encoded receipt status to 1 failed with `Merkle proof validation failed` |
| Mined fixed rebate | [Claim receipt](https://creditcoin-testnet.blockscout.com/tx/0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035), block 5,473,655, status 1; `RebatePaid` for 1 test CTC; vault balance 10 -> 9 |
| Beneficiary transfer | Gross 1 test CTC; wallet net increase **0.9999184485 test CTC** after paying **0.0000815515 test CTC** claim gas; exact block-boundary balance check passed |
| Live negative controls | Tampered status, wrong source chain, unissued ticket and duplicate claim rejected by read-only RPC calls; no second mined claim |
| Public app | [GasBack](https://gasback-ctc-2026.stetang.chatgpt.site); final Sites version deployed with completed-run evidence, Peter V2 video and PDF |
| Public GitHub repository | [stetang98/gasback-attestcoin](https://github.com/stetang98/gasback-attestcoin); reviewed source and completed-run evidence publicly accessible |
| PDF deck | [Published six-page evidence deck](https://gasback-ctc-2026.stetang.chatgpt.site/GasBack-deck.pdf); anonymous HTTP 200 and exact local/public SHA-256 match |
| Peter V2 demonstration | [Watch the published video](https://gasback-ctc-2026.stetang.chatgpt.site/demo.html) · [MP4](https://gasback-ctc-2026.stetang.chatgpt.site/demo.mp4) · [SRT](https://gasback-ctc-2026.stetang.chatgpt.site/demo.srt); public file checks passed; local and public browser playback both reached the end without media errors |
| DoraHacks draft | Updated Details and Profile demo-video URL saved successfully. Not submitted; the participant's primary Telegram and informed eligibility confirmation remain required |

All seven release links (video page, MP4, SRT, PDF, run, proof and reviewed verification) returned anonymous HTTP 200. The MP4, PDF and three JSON evidence files match the canonical local hashes. Local and public browser playback reached **110.08 s**, with `ended=true` and no media error; public playback also reported `readyState=4`. The public session paused at 98.78 s and then resumed to the end. A complete human listening pass has not been recorded. See [public release evidence](docs/qa/public-release-check.json), [release validation](docs/submission/validation.md) and [Peter V2 production record](docs/qa/chatcut-v2-edit-summary.md).

The deployment, ticket, source action and claim were executed by the reproducible **CLI workflow**. The web interface replays linked evidence and performs **read-only** verification; opening it or pressing replay does not create another payout. The earlier historical feasibility probe is separate from this project's completed run. Local policy tests still use a disclosed verifier harness.

One dedicated test wallet filled the sponsor, source-sender and claimant roles in this demonstration. The run proves the technical path; it does not establish independent sponsor adoption or production use.

The fresh post-run review identified and then closed a P2 issue in the **independent verification script**. The fix binds the signed source transaction hash and decoded policy fields to the historical on-chain ticket, vault-emitted `TicketIssued`/`RebatePaid`, nullifier, source block, amount, beneficiary and consumed state. All 16 new verifier regression tests passed; the 42 contract and 10 web tests passed, and an independent live RPC/native/balance/duplicate recheck passed. No Critical or Important finding remains **within that reviewed testnet code and evidence scope**. This is a bounded code review, not a professional security audit of the project or native precompile.

The ticket's target block timestamp was `06:41:45 UTC`; the source failure block timestamp was `06:42:00 UTC`. The runner confirmed the ticket before broadcasting the source action. These timestamps are independent RPC observations across two chains, not a source UTC timestamp proven by the Attestcoin payload.

Attestation was first observed ready **8 min 54.575 s** after the source failure confirmation (`06:42:05.151 -> 06:50:59.726 UTC`); native verification completed after **8 min 57.415 s**. The 15-second polling interval means this is observed end-to-end waiting, not the exact attestation publication time or a latency guarantee. Claim submission to receipt confirmation took **5.061 s**. See [proof timing](integration/evidence/proof-verification.json) and [payment/balance evidence](integration/evidence/claim.json).

## The product in one flow

1. A sponsor funds the Creditcoin vault and issues an immutable ticket for a particular source sender, destination, nonce, calldata hash, minimum gas limit and source-block interval. The ticket also fixes the beneficiary, rebate and claim deadline.
2. The user sends the eligible zero-value type-2 transaction on Sepolia. The demonstration action intentionally reverts so the outcome is reproducible and honest.
3. A relayer obtains the attested payload and inclusion/continuity proof. The relayer can submit data but cannot choose who gets paid.
4. `GasBackVault.claim` calls the fixed native verifier at `0x0000000000000000000000000000000000000FD2`. It decodes only the verified bytes and requires receipt status zero plus every ticket condition.
5. The vault consumes both the ticket and verified source identity, then pays the fixed test-CTC rebate. Duplicate claims, wrong intent and successful source transactions are rejected; a failed transfer rolls back consumption.

Removing Attestcoin removes the independent source-failure check. Replacing it with a database flag would make the operator the authority deciding whether the remote transaction failed. See [architecture and integration](docs/architecture.md).

## Reproduce locally

The checked development environment uses Node 24 and pnpm 11. No funded wallet is needed for these local commands:

```powershell
pnpm --dir chain install --frozen-lockfile
pnpm --dir chain test
pnpm --dir chain compile
pnpm --dir web test
python -m http.server 4173 --bind 127.0.0.1 --directory web/dist
```

Open `http://127.0.0.1:4173`. The `web/dist` directory is a static replay and verification app, with no backend signer. Match its displayed transaction hashes to the evidence files when reviewing the completed run.

For an actual testnet run, follow [the integration runbook](integration/README.md). It uses `@gluwa/usc-sdk` 0.18.0, checks chain IDs before signing, and stores pending transaction hashes to resume safely. A dedicated test-only wallet and faucet assets are required for deployments and claims; its private key stays outside the repository. The completed campaign was funded with 10 test CTC and paid its fixed 1 test CTC rebate.

```powershell
pnpm --dir integration install --frozen-lockfile --ignore-scripts
node integration/source.cjs
node integration/target.cjs
node integration/prospective-source.cjs
node integration/proof.cjs --wait
node integration/claim.cjs
node integration/normalize.cjs
node integration/verify-public.cjs
```

To inspect this completed run without a funded wallet, use `node integration/verify-public.cjs`; it performs public RPC reads and native `eth_call` checks. The preceding transaction-producing commands are for test-only wallets. Preserve the measured waiting interval in any recording rather than presenting attestation as instantaneous.

## Design boundaries

- The supported source is Ethereum Sepolia, chain ID `11155111`, Attestcoin chain key `1`. The target is Creditcoin testnet, chain ID `102031`.
- Only zero-value type-2 source transactions are accepted. The beneficiary equals the verified source sender; arbitrary cross-chain contract-account ownership is outside scope.
- The sponsor decides eligibility before the action. A source block range constrains policy; the payload does not prove a source UTC timestamp or independently establish authorization order.
- The proof establishes a failed transaction, not user innocence, protocol fault, downtime, or economic damages. A user can deliberately revert. One-use tickets and bounded campaign funding limit the sponsor's exposure; they are not a claim of perfect Sybil prevention.
- Tickets do not reserve funds. There is no owner withdrawal, cancellation, upgrade, price oracle or mainnet deployment in this MVP.

See [the threat model](docs/threat-model.md) for assumptions, attacks and evidence limits.

## Review and submission materials

- [Attestcoin integration and architecture](docs/architecture.md)
- [Threat model](docs/threat-model.md)
- [Independent contract source review](docs/research/contract-review.md)
- [Final code review and closed evidence-verifier finding](docs/qa/final-code-review.md)
- [DoraHacks English fields and evidence gates](docs/submission/dorahacks-draft.md)
- [90-120 second demonstration script](docs/submission/demo-script.md)
- [Editable six-page deck content](docs/submission/deck-content.md)
- [Chinese participant handoff](docs/submission/user-handoff-zh.md)

Original GasBack code was created during the September 2026 hackathon period. Official Gluwa libraries and other third-party dependencies remain attributed to their authors and licenses. Codex and Superpowers assisted planning, implementation and review; human team identity, eligibility and final declarations must be supplied accurately by the participant. The prototype has no claimed users, partnerships, revenue or professional security audit.

## Official references

- [Competition rules](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail)
- [Organizer overview and deadline](https://buidl.creditcoin.org/)
- [Attestcoin SDK guide](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk)
- [Creditcoin testnet endpoints](https://docs.creditcoin.org/environments/testnet)
- [Official Solidity package](https://github.com/gluwa/asc-contracts)
- [Native verifier interface](https://github.com/gluwa/creditcoin3/blob/usc-dev/precompiles/metadata/sol/block_prover.sol)
