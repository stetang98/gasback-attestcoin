# GasBack

**A failed transaction should not require a support ticket. Prove the failure. Claim the sponsor rebate.**

GasBack is a sponsor-funded, fixed rebate for a preauthorized reverted transaction on another chain. A Creditcoin smart contract uses the Attestcoin Protocol to verify the source transaction and its failed receipt, checks the sponsor's exact ticket policy, and pays the fixed amount to the verified sender.

Built for [BUIDL CTC 2026 Fall](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail), primary track **DeFi**. All deployments and amounts in this prototype use **test assets**. This is a capped sponsorship program, not insurance or a promise to reimburse the full gas cost.

## Current evidence

Snapshot: `2026-09-12T05:56:16.294Z`. The repository is under active development; use [the machine-readable run](integration/evidence/run.json) for the latest recorded state.

| Item | Status |
| --- | --- |
| Solidity contracts and 42 policy/security test cases | Implemented; see [contract package](chain/README.md) and [independent source review](docs/research/contract-review.md) |
| Sepolia source deployment | Receipt status 1, block 11,686,978; [deployment transaction](https://sepolia.etherscan.io/tx/0x11c6cadadf3b945cda0b2cb4129e736932518cc7d042c83d67fbcb68c2676267) |
| Source contract | [`0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea`](https://sepolia.etherscan.io/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea) |
| Target vault, prospective ticket, eligible failed action, native proof and rebate | Pending at this snapshot; no completed rebate is claimed |
| Public app | Expected URL: [GasBack](https://gasback-ctc-2026.jazzy-lamp-4850.chatgpt.site); publication and public access are pending verification |
| Public GitHub repository | [stetang98/gasback-attestcoin](https://github.com/stetang98/gasback-attestcoin) |
| PDF deck | [Six-page review draft](docs/submission/GasBack-deck.pdf); public PDF URL pending |
| Demonstration video / DoraHacks submission | Pending; [recording script](docs/submission/demo-script.md) and [submission draft](docs/submission/dorahacks-draft.md) are prepared |

A historical proof probe establishes feasibility only. It is not a deployment or payout by this project. Local policy tests use a clearly identified verifier harness; they do not substitute for native verification on Creditcoin.

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

Open `http://127.0.0.1:4173`. The UI must preserve pending states; opening it is not evidence that a claim executed. The `web/dist` directory contains the static application, not a backend signer.

For an actual testnet run, follow [the integration runbook](integration/README.md). It uses `@gluwa/usc-sdk` 0.18.0, checks chain IDs before signing, and stores pending transaction hashes to resume safely. A dedicated test-only wallet and faucet assets are required for deployments and claims; its private key stays outside the repository. The planned demo campaign has 10 test CTC in funding and a fixed 1 test CTC rebate; these are configuration values until live evidence confirms them.

```powershell
pnpm --dir integration install --frozen-lockfile --ignore-scripts
node integration/source.cjs
node integration/target.cjs
node integration/prospective-source.cjs
node integration/proof.cjs --wait
node integration/claim.cjs
node integration/normalize.cjs
```

Do not run the transaction-producing steps using a wallet with real assets. Use the recorded proof and read-only checks when reviewing an existing run. Attestation takes time; recorded timestamps and any skipped waiting period belong in the demonstration.

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
