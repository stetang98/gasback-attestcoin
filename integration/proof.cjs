const { proofProvider, chainInfo, blockProver } = require('@gluwa/usc-sdk');
const { ethers, RPC, write, read, provider, reportError } = require('./common.cjs');
async function prepareProof({ wait = false } = {}) {
  const source = read('source-failure.json');
  if (!source || source.receipt.status !== 0) throw new Error('Confirmed source failure evidence is required');
  const p = await provider('target');
  try {
    const info = new chainInfo.PrecompileChainInfoProvider(p);
    const chains = await info.getSupportedChains();
    const builder = new proofProvider.service.ProofBuilder(1, RPC.prover, 30000);
    const latest = await info.getLatestAttestedHeightAndHash(1);
    console.log(JSON.stringify({ sourceBlock: source.receipt.blockNumber, attestedHeight: latest.height, waitingRequired: latest.height < source.receipt.blockNumber }));
    if (wait) await builder.waitUntilHeightAttested(1, source.receipt.blockNumber, 15000, 1200000);
    else if (latest.height < source.receipt.blockNumber) throw new Error('Source block not yet attested; rerun with --wait');
    const result = await builder.getProof(source.receipt.transactionHash);
    if (!result.success || !result.data) throw new Error(result.error || 'Proof service returned no data');
    const proof = result.data;
    const prover = new blockProver.PrecompileBlockProver(p);
    const verified = await prover.verifySingle(proof.chainKey, proof.headerNumber, proof.txBytes, proof.merkleProof, proof.continuityProof);
    if (!verified) throw new Error('Native verifier did not accept source proof');
    const coder = ethers.AbiCoder.defaultAbiCoder();
    const [type, chunks] = coder.decode(['uint8', 'bytes[]'], proof.txBytes);
    const common = coder.decode(['uint64','uint64','address','bool','address','uint256','bytes'], chunks[0]);
    const receipt = coder.decode(['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'], chunks[chunks.length - 1]);
    if (Number(type) !== 2 || Number(receipt[0]) !== 0 || common[2].toLowerCase() !== source.sender.toLowerCase() || common[4].toLowerCase() !== source.target.toLowerCase() || common[6] !== source.data || Number(common[0]) !== source.nonce) throw new Error('Decoded proof does not match recorded source intent');
    const changed = [...chunks];
    changed[changed.length - 1] = coder.encode(['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'], [1, receipt[1], [...receipt[2]], receipt[3]]);
    const tamperedBytes = coder.encode(['uint8','bytes[]'], [type, changed]);
    let tamperRejected = false, tamperReason;
    try { tamperRejected = !await prover.verifySingle(proof.chainKey, proof.headerNumber, tamperedBytes, proof.merkleProof, proof.continuityProof); }
    catch (error) { tamperRejected = true; tamperReason = error.shortMessage || error.message; }
    if (!tamperRejected) throw new Error('Tampered status was unexpectedly accepted');
    write('source-proof.json', proof);
    write('proof-verification.json', {
      observedAt: new Date().toISOString(), mode: 'read-only native precompile eth_call', sdkVersion: '0.18.0',
      sourceTransaction: source.receipt.transactionHash, headerNumber: proof.headerNumber, chainKey: proof.chainKey,
      supportedChains: chains, verified, tamperRejected, tamperReason,
      decoded: {type: Number(type), nonce: Number(common[0]), gasLimit: common[1].toString(), from: common[2], to: common[4],
        value: common[5].toString(), data: common[6], receiptStatus: Number(receipt[0]), receiptGasUsed: receipt[1].toString()},
      boundary: 'Proves failure and transaction identity. Does not establish fault, damages, or source UTC timestamp.'
    });
    console.log(JSON.stringify({ nativeProofVerified: verified, tamperRejected, txHash: source.receipt.transactionHash }));
    return proof;
  } finally { p.destroy(); }
}
module.exports = { prepareProof };
if (require.main === module) prepareProof({wait: process.argv.includes('--wait')}).catch(reportError);
