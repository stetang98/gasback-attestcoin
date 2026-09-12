const { blockProver } = require('@gluwa/usc-sdk');
const { fs, path, EVIDENCE, ethers, read, artifact, provider, reportError } = require('./common.cjs');
const { assertPublicEvidence, decodeVerifiedSource } = require('./public-evidence.cjs');
function outputName(argv) {
  if (argv.length===0) return 'public-reverification-reviewed.json';
  if (argv.length!==2 || argv[0]!=='--output' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.json$/.test(argv[1]))
    throw new Error('Usage: node verify-public.cjs [--output evidence-filename.json]');
  if (['run.json','source-proof.json','public-reverification.json'].includes(argv[1].toLowerCase()))
    throw new Error('Refusing to overwrite the run, proof or original public evidence');
  return argv[1];
}
async function main() {
  const output=outputName(process.argv.slice(2));
  const outputPath=path.join(EVIDENCE,output);
  if (fs.existsSync(outputPath)) throw new Error('Evidence output already exists; choose a new --output filename');
  const source = await provider('source');
  const target = await provider('target');
  try {
    const run = read('run.json');
    const proof = read('source-proof.json');
    if (!run?.claimTxHash || !proof) throw new Error('This evidence run has no completed live rebate yet');
    const [sourceTx,sourceReceipt,claimReceipt,ticketReceipt] = await Promise.all([
      source.getTransaction(run.sourceTxHash),source.getTransactionReceipt(run.sourceTxHash),
      target.getTransactionReceipt(run.claimTxHash),target.getTransactionReceipt(run.ticket.receipt.transactionHash)]);
    if (!sourceReceipt || sourceReceipt.status !== 0 || !claimReceipt || claimReceipt.status !== 1 || !ticketReceipt || ticketReceipt.status !== 1) throw new Error('Expected source failure / target success receipts missing');
    const verifier = new blockProver.PrecompileBlockProver(target);
    const nativeVerified = await verifier.verifySingle(proof.chainKey, proof.headerNumber, proof.txBytes, proof.merkleProof, proof.continuityProof);
    if (!nativeVerified) throw new Error('Native verifier rejected proof');
    const decodedSource=decodeVerifiedSource(proof,nativeVerified);
    const vault = new ethers.Contract(run.vaultAddress, artifact('GasBackVault').abi, target);
    const atClaim={blockTag:claimReceipt.blockNumber};
    const [storedTicket,issued,claimed,spent,owner,ticketBlock,sourceBlock,claimBlock]=await Promise.all([
      vault.tickets(run.ticketId,atClaim),vault.issued(run.ticketId,atClaim),vault.claimed(run.ticketId,atClaim),
      vault.spentTransactions(decodedSource.nullifier,atClaim),vault.owner(atClaim),
      target.getBlock(ticketReceipt.blockNumber),source.getBlock(sourceReceipt.blockNumber),target.getBlock(claimReceipt.blockNumber)]);
    const {paidEvent,ticket,nullifier}=assertPublicEvidence({run,proof,nativeVerified,sourceTx,sourceReceipt,claimReceipt,ticketReceipt,
      storedTicket,issued,claimed,spent,owner,ticketBlock,sourceBlock,claimBlock,iface:vault.interface});
    const beneficiaryBefore = await target.getBalance(run.beneficiary, claimReceipt.blockNumber - 1);
    const beneficiaryAfter = await target.getBalance(run.beneficiary, claimReceipt.blockNumber);
    const claimGasFee = claimReceipt.gasUsed * claimReceipt.gasPrice;
    const expectedNetDelta = paidEvent.args.amount - (claimReceipt.from.toLowerCase() === run.beneficiary.toLowerCase() ? claimGasFee : 0n);
    if (beneficiaryAfter - beneficiaryBefore !== expectedNetDelta) throw new Error('Beneficiary net balance change does not reconcile with rebate and claim gas');
    let duplicateError;
    try { await vault.claim.staticCall(run.ticketId, proof.chainKey, proof.headerNumber, proof.txBytes, proof.merkleProof, proof.continuityProof); }
    catch(error) { try { duplicateError = vault.interface.parseError(error.data || error.info?.error?.data)?.name; } catch {} }
    if (duplicateError !== 'TicketAlreadyClaimed') throw new Error('Independent read-only duplicate check did not return TicketAlreadyClaimed');
    const result = { observedAt:new Date().toISOString(), mode:'read-only RPC and eth_call; no wallet needed',
      verifierRevision:'source-ticket-event-binding-v2',
      nativeVerified, sourceFailureConfirmed:true, targetPayoutConfirmed:true,
      sourceTxHash:run.sourceTxHash, claimTxHash:run.claimTxHash, ticketId:run.ticketId,
      rebateWei:run.rebateWei, asset:'test CTC',
      beneficiaryGrossRebateWei:paidEvent.args.amount.toString(), beneficiaryNetDeltaWei:(beneficiaryAfter-beneficiaryBefore).toString(),
      claimGasFeeWei:claimGasFee.toString(), beneficiaryTransferConfirmed:true,
      sourceTicketPaymentBindingConfirmed:true, vaultEventEmittersConfirmed:true,
      signedSourceTransactionHash:decodedSource.transactionHash, sourceNullifier:nullifier,
      paidEventSourceBlock:paidEvent.args.sourceBlock.toString(),
      storedTicketAtClaimBlock:Object.fromEntries(Object.entries(ticket).map(([k,v])=>[k,typeof v==='bigint'?v.toString():v])),
      ticketIssuedConfirmed:true, sourceConsumedAtClaimBlock:spent, checkedClaimBlock:claimReceipt.blockNumber,
      duplicateRejected:true, duplicateError, duplicateCheckMode:'read-only eth_call; no second mined claim',
      authorizationTargetBlockTimestamp:ticketBlock.timestamp, sourceFailureBlockTimestamp:sourceBlock.timestamp,
      timingBoundary:'Timestamps here are separate RPC observations. Source timestamp is not part of the Attestcoin transaction encoding.',
      vaultCodeHash:ethers.keccak256(await target.getCode(run.vaultAddress)),
      totalPaid:(await vault.totalPaid()).toString() };
    // Evidence snapshots are append-only by filename, including on case-insensitive Windows.
    fs.writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify(result,null,2));
  } finally {source.destroy();target.destroy();}
}
if (require.main===module) main().catch(reportError);
module.exports={main,outputName};
