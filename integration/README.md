# Live testnet integration

These scripts produce public, inspectable evidence of a **prospectively authorized** failed Sepolia transaction receiving a fixed sponsor rebate on Creditcoin testnet. They reject all other chain IDs and submit no mainnet transactions.

## Install and inputs

Run `pnpm --dir integration install --frozen-lockfile --ignore-scripts`. Compile `chain/` first so `chain/artifacts/DemoAction.json` and `chain/artifacts/GasBackVault.json` exist. The integration uses ethers 6.17.0 and the official `@gluwa/usc-sdk` 0.18.0.

The signing scripts read a dedicated **test-only** wallet JSON containing `address` and `privateKey`, from the file named by `GASBACK_TEST_WALLET_FILE`. If that variable is unset, they use `.codex/tmp/gasback-testnet-secrets/wallet.json` under the current user's home. Keep this file outside the repository and never upload its contents. A public judge does not need this file to run `proof.cjs`.

The test wallet needs free Sepolia ETH and Creditcoin test CTC. The target script uses 10 test CTC to prefund the vault and authorizes a fixed 1 test CTC rebate. Amounts are test assets, with no fiat conversion or promise to reimburse exact gas cost.

## Execute in order

1. `node integration/source.cjs` deploys only `DemoAction` on Sepolia.
2. `node integration/target.cjs` deploys and funds `GasBackVault`, then confirms a ticket binding source sender, target, nonce, exact calldata hash, minimum gas, source block range, fixed beneficiary/rebate, and target-chain claim deadline.
3. `node integration/prospective-source.cjs` refuses to send until the ticket exists. It submits the matching `fail` call with transaction type 2, zero value, and an explicit 100,000 gas limit. The resulting receipt must have status 0.
4. `node integration/proof.cjs --wait` waits for source attestation, calls the hosted proof builder, then uses the native precompile via **read-only `eth_call`**. It also changes the proof-bound receipt status and confirms that the native verifier rejects the altered proof. Recent Sepolia blocks may need roughly 8–10 minutes to be attested; actual evidence timestamps are retained.
5. `node integration/claim.cjs` preflights the real claim, submits it, checks the `RebatePaid` event and vault state, then verifies that an identical second claim is rejected using **read-only `eth_call`**. The duplicate check is not represented as a second mined transaction.
6. `node integration/normalize.cjs` writes `evidence/run.json` for the frontend. Unfinished stages remain null and the status describes actual progress.

Scripts save pending transaction hashes before waiting. Re-running resumes a pending operation instead of blindly resubmitting. The supplied evidence identifies one run; use a separate copied project/evidence directory for a new deployment rather than overwriting published transaction history.

## Evidence

`evidence/` holds only public addresses, policy parameters, transaction receipts, proof bytes, and observed verification results. A deployed source contract is not a completed rebate. A native `eth_call` result is not a mined claim. Read `claim.json` and `duplicate-rejection.json` to determine whether those steps actually completed.

After a completed run, judges can run `node integration/verify-public.cjs` with **no wallet file**. It independently fetches both-chain receipts, verifies the source proof through the native precompile, matches transaction identity, and checks the actual target rebate event/state against the public manifest.

The proof binds the source block number and encoded transaction/receipt. It does not include a source block UTC timestamp and does not prove fault, innocence, an off-chain incident, or economic loss. The demonstration intentionally reverts; tickets and campaign funds constrain sponsor exposure.

## Networks and official references

- Sepolia: chain ID `11155111`, source chain key `1` on Creditcoin testnet.
- Creditcoin testnet: chain ID `102031`, RPC `https://rpc.cc3-testnet.creditcoin.network`.
- Native verifier: `0x0000000000000000000000000000000000000FD2`.
- Proof builder: `https://prover.cc3-testnet.creditcoin.network`.
- [Official Attestcoin SDK guide](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk)
- [Official testnet endpoints](https://docs.creditcoin.org/environments/testnet)
- [Official transaction encoding](https://github.com/gluwa/cc-next-query-builder/blob/main/src/encoding/abi/v1.ts)
- [Official examples and faucet instructions](https://github.com/gluwa/attestcoin-protocol-examples/tree/main/bridge/hello-bridge)
