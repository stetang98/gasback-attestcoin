const { blockProver } = require('@gluwa/usc-sdk');
const { ethers, read, artifact, provider, write, reportError } = require('./common.cjs');
async function main() {
  const source = await provider('source');
  const target = await provider('target');
  try {
    const run = read('run.json');
    const proof = read('source-proof.json');
    if (!run?.claimTxHash || !proof) throw new Error('This evidence run has no completed live rebate yet');
    const sourceTx = await source.getTransaction(run.sourceTxHash);
    const sourceReceipt = await source.getTransactionReceipt(run.sourceTxHash);
    const claimReceipt = await target.getTransactionReceipt(run.claimTxHash);
    const ticketReceipt = await target.getTransactionReceipt(run.ticket.receipt.transactionHash);
    if (!sourceReceipt || sourceReceipt.status !== 0 || !claimReceipt || claimReceipt.status !== 1 || !ticketReceipt || ticketReceipt.status !== 1) throw new Error('Expected source failure / target success receipts missing');
    const verifier = new blockProver.PrecompileBlockProver(target);
    const nativeVerified = await verifier.verifySingle(proof.chainKey, proof.headerNumber, proof.txBytes, proof.merkleProof, proof.continuityProof);
    if (!nativeVerified) throw new Error('Native verifier rejected proof');
    const coder = ethers.AbiCoder.defaultAbiCoder();
    const [type, chunks] = coder.decode(['uint8','bytes[]'], proof.txBytes);
    const common = coder.decode(['uint64','uint64','address','bool','address','uint256','bytes'], chunks[0]);
    const decodedReceipt = coder.decode(['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'], chunks[chunks.length-1]);
    if (Number(type)!==2 || Number(decodedReceipt[0])!==0 || common[2].toLowerCase()!==sourceTx.from.toLowerCase() || common[4].toLowerCase()!==sourceTx.to.toLowerCase() || Number(common[0])!==sourceTx.nonce || common[6]!==sourceTx.data || proof.headerNumber!==sourceReceipt.blockNumber) throw new Error('Proved identity differs from linked source receipt');
    const vault = new ethers.Contract(run.vaultAddress, artifact('GasBackVault').abi, target);
    const paidEvent = claimReceipt.logs.map(l=>{try{return vault.interface.parseLog(l);}catch{return null;}}).find(l=>l?.name==='RebatePaid');
    if (!paidEvent || paidEvent.args.ticketId!==run.ticketId || paidEvent.args.beneficiary.toLowerCase()!==run.beneficiary.toLowerCase() || paidEvent.args.amount.toString()!==run.rebateWei || !await vault.claimed(run.ticketId)) throw new Error('Payout event or state differs from manifest');
    const ticketBlock = await target.getBlock(ticketReceipt.blockNumber);
    const sourceBlock = await source.getBlock(sourceReceipt.blockNumber);
    const result = { observedAt:new Date().toISOString(), mode:'read-only RPC and eth_call; no wallet needed',
      nativeVerified, sourceFailureConfirmed:true, targetPayoutConfirmed:true,
      sourceTxHash:run.sourceTxHash, claimTxHash:run.claimTxHash, ticketId:run.ticketId,
      rebateWei:run.rebateWei, asset:'test CTC',
      authorizationTargetBlockTimestamp:ticketBlock.timestamp, sourceFailureBlockTimestamp:sourceBlock.timestamp,
      timingBoundary:'Timestamps here are separate RPC observations. Source timestamp is not part of the Attestcoin transaction encoding.',
      vaultCodeHash:ethers.keccak256(await target.getCode(run.vaultAddress)),
      totalPaid:(await vault.totalPaid()).toString() };
    write('public-reverification.json',result);
    console.log(JSON.stringify(result,null,2));
  } finally {source.destroy();target.destroy();}
}
main().catch(reportError);
