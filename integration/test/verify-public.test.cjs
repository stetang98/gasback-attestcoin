const assert = require('node:assert/strict');
const { test } = require('node:test');
const { ethers, read, artifact } = require('../common.cjs');
const { assertPublicEvidence, decodeVerifiedSource, vaultEvents } = require('../public-evidence.cjs');
const coder = ethers.AbiCoder.defaultAbiCoder();
const iface = new ethers.Interface(artifact('GasBackVault').abi);
const COMMON = ['uint64','uint64','address','bool','address','uint256','bytes'];
const TYPE2 = ['uint64','uint128','uint128','tuple(address,bytes32[])[]','uint8','bytes32','bytes32'];
const RECEIPT = ['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'];

function fixture() {
  const run = read('run.json');
  const proof = read('source-proof.json');
  const [, chunks] = coder.decode(['uint8','bytes[]'], proof.txBytes);
  const c = coder.decode(COMMON, chunks[0]);
  const t = coder.decode(TYPE2, chunks[1]);
  const signed = ethers.Transaction.from({ type:2, chainId:t[0], nonce:Number(c[0]), gasLimit:c[1], to:c[4], value:c[5], data:c[6],
    maxPriorityFeePerGas:t[1], maxFeePerGas:t[2], accessList:t[3].map(e=>({address:e[0],storageKeys:[...e[1]]})),
    signature:{yParity:Number(t[4]),r:t[5],s:t[6]} });
  const sourceTx = { hash:signed.hash, chainId:signed.chainId, type:2, from:signed.from, to:signed.to, nonce:signed.nonce,
    gasLimit:signed.gasLimit, value:signed.value, data:signed.data, blockNumber:run.sourceFailure.receipt.blockNumber };
  const publicResult = read('public-reverification.json');
  return { run, proof, nativeVerified:true, sourceTx, sourceReceipt:structuredClone(run.sourceFailure.receipt),
    claimReceipt:structuredClone(run.claim.receipt), ticketReceipt:structuredClone(run.ticket.receipt),
    storedTicket:structuredClone(run.ticket.ticket), issued:true, claimed:true, spent:true,
    owner:run.targetDeployment.owner,
    ticketBlock:{timestamp:publicResult.authorizationTargetBlockTimestamp},
    sourceBlock:{timestamp:publicResult.sourceFailureBlockTimestamp},
    claimBlock:{timestamp:run.claim.targetBlockTimestamp} };
}

function replaceEvent(f, receiptName, name, change) {
  const receipt = f[receiptName];
  const log = receipt.logs.find(l=>{try{return iface.parseLog(l)?.name===name;}catch{return false;}});
  const event = iface.parseLog(log);
  const values = [...event.args];
  change(values);
  const encoded = iface.encodeEventLog(iface.getEvent(name), values);
  log.topics = encoded.topics; log.data = encoded.data;
}

test('recorded real paid run binds source, on-chain ticket and both vault events', () => {
  const f = fixture();
  const result = assertPublicEvidence(f);
  assert.equal(result.nullifier, f.run.claim.nullifier);
  assert.equal(result.source.transactionHash, f.run.sourceTxHash);
  assert.equal(result.paidEvent.args.amount.toString(), f.run.rebateWei);
});

test('another valid signed type-2 failure/proof cannot borrow the existing paid claim', async () => {
  const f = fixture();
  // A separate valid signed transaction; the native-verification boundary is mocked true.
  // This creates an ephemeral unit-test wallet, never reads a user key or broadcasts.
  const raw = await ethers.Wallet.createRandom().signTransaction({type:2, chainId:11155111, nonce:101,
    gasLimit:100000, to:f.sourceTx.to, value:0, data:f.sourceTx.data, maxPriorityFeePerGas:1, maxFeePerGas:10});
  const tx = ethers.Transaction.from(raw);
  const chunks = [coder.encode(COMMON,[tx.nonce,tx.gasLimit,tx.from,false,tx.to,tx.value,tx.data]),
    coder.encode(TYPE2,[tx.chainId,tx.maxPriorityFeePerGas,tx.maxFeePerGas,[],tx.signature.yParity,tx.signature.r,tx.signature.s]),
    coder.encode(RECEIPT,[0,22440,[],'0x'+'00'.repeat(256)])];
  f.proof.txBytes=coder.encode(['uint8','bytes[]'],[2,chunks]); f.proof.txHash=tx.hash;
  f.run.sourceTxHash=tx.hash;
  f.sourceTx={...f.sourceTx,hash:tx.hash,from:tx.from,nonce:tx.nonce};
  f.sourceReceipt={...f.sourceReceipt,transactionHash:tx.hash,from:tx.from};
  assert.equal(decodeVerifiedSource(f.proof,true).transactionHash,tx.hash);
  assert.throws(()=>assertPublicEvidence(f), /stored ticket source identity/i);
});

for (const [name, receiptName, eventName] of [
  ['payout','claimReceipt','RebatePaid'], ['ticket issuance','ticketReceipt','TicketIssued']
]) test('same-signature '+name+' event from a foreign emitter is rejected', () => {
  const f=fixture();
  f[receiptName].logs.forEach(log=>{log.address='0x1111111111111111111111111111111111111111';});
  assert.throws(()=>assertPublicEvidence(f), new RegExp('vault '+eventName,'i'));
});

test('foreign same-signature callback log is ignored when the genuine vault event exists', () => {
  const f=fixture();
  f.claimReceipt.logs.unshift({...f.claimReceipt.logs[0],address:'0x1111111111111111111111111111111111111111'});
  assert.equal(vaultEvents(f.claimReceipt.logs,iface,f.run.vaultAddress,'RebatePaid').length,1);
  assertPublicEvidence(f);
});

for (const [label,index,value] of [
  ['ticketId',0,ethers.ZeroHash], ['nullifier',1,ethers.ZeroHash],
  ['beneficiary',2,'0x1111111111111111111111111111111111111111'],
  ['amount',3,1n], ['sourceBlock',4,1n]
]) test('RebatePaid '+label+' mismatch is rejected',()=>{
  const f=fixture(); replaceEvent(f,'claimReceipt','RebatePaid',values=>{values[index]=value;});
  assert.throws(()=>assertPublicEvidence(f), /RebatePaid.*binding/i);
});

test('manifest cannot substitute a stored ticket field',()=>{
  const f=fixture(); f.run.ticket.ticket.claimDeadline += 1;
  assert.throws(()=>assertPublicEvidence(f), /manifest ticket.*claimDeadline/i);
});

test('proof policy must also match stored minimum gas and block interval',()=>{
  const f=fixture(); f.storedTicket.minGasLimit=200000; f.run.ticket.ticket.minGasLimit=200000;
  assert.throws(()=>assertPublicEvidence(f), /gas limit/i);
  const g=fixture(); g.storedTicket.minSourceBlock=g.proof.headerNumber+1;g.run.ticket.ticket.minSourceBlock=g.storedTicket.minSourceBlock;
  assert.throws(()=>assertPublicEvidence(g), /source block.*ticket/i);
});

test('foreign claim/ticket receipt destinations are rejected',()=>{
  for (const field of ['claimReceipt','ticketReceipt']) {
    const f=fixture(); f[field].to='0x1111111111111111111111111111111111111111';
    assert.throws(()=>assertPublicEvidence(f), /receipt destination/i);
  }
});

test('native rejection stops before payload decoding',()=>{
  const f=fixture();f.nativeVerified=false;f.proof.txBytes='0x';
  assert.throws(()=>assertPublicEvidence(f),/native verifier/i);
});

test('wrong chain key, contract creation and nonzero value fail source policy',()=>{
  const f=fixture();f.proof.chainKey=3;
  assert.throws(()=>assertPublicEvidence(f),/source chain key/i);
  for (const [index,value,reason] of [[3,true,/contract creation/i],[5,1n,/zero value/i]]) {
    const g=fixture();const [type,chunks]=coder.decode(['uint8','bytes[]'],g.proof.txBytes);
    const common=[...coder.decode(COMMON,chunks[0])];common[index]=value;
    const changed=[...chunks];changed[0]=coder.encode(COMMON,common);
    g.proof.txBytes=coder.encode(['uint8','bytes[]'],[type,changed]);
    assert.throws(()=>assertPublicEvidence(g),reason);
  }
});

test('reviewed output cannot overwrite original evidence or escape the evidence directory',()=>{
  const {outputName}=require('../verify-public.cjs');
  assert.equal(outputName([]),'public-reverification-reviewed.json');
  assert.equal(outputName(['--output','public-reverification-review-2.json']),'public-reverification-review-2.json');
  for(const filename of ['run.json','RUN.JSON','source-proof.json','public-reverification.json','Public-Reverification.JSON','../run.json','C:/run.json']) {
    assert.throws(()=>outputName(['--output',filename]));
  }
});
