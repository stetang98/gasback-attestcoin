// Pure checks for independent public evidence. RPC/native verification happen in the caller.
// Encoding mirrors pinned @gluwa/asc-contracts 0.2.1 EvmV1Decoder.sol, type 2 only.
const { ethers } = require('./common.cjs');
const coder = ethers.AbiCoder.defaultAbiCoder();
const COMMON = ['uint64','uint64','address','bool','address','uint256','bytes'];
const TYPE2 = ['uint64','uint128','uint128','tuple(address,bytes32[])[]','uint8','bytes32','bytes32'];
const RECEIPT = ['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'];
const TICKET_FIELDS = ['beneficiary','sourceSender','sourceTarget','sourceNonce','minSourceBlock',
  'maxSourceBlock','claimDeadline','minGasLimit','rebate','calldataHash'];
const NUMERIC_TICKET_FIELDS = new Set(['sourceNonce','minSourceBlock','maxSourceBlock','claimDeadline','minGasLimit','rebate']);
function check(condition, message) { if (!condition) throw new Error(message); }
function hexEqual(a,b) { return typeof a==='string' && typeof b==='string' && a.toLowerCase()===b.toLowerCase(); }
function uint(value, name) {
  try { check(value !== null && value !== undefined, 'missing'); const n=BigInt(value); check(n>=0n,'negative'); return n; }
  catch { throw new Error('Missing or invalid integer: '+name); }
}
function hashOf(receipt) { return receipt?.hash || receipt?.transactionHash; }

function decodeVerifiedSource(proof, nativeVerified) {
  // Do not inspect/decode a payload before the real native call succeeds.
  check(nativeVerified === true, 'Native verifier did not authenticate this proof');
  check(uint(proof.chainKey,'chainKey')===1n, 'Wrong source chain key');
  const [type,chunks]=coder.decode(['uint8','bytes[]'],proof.txBytes);
  check(type===2n && chunks.length===3,'Expected type-2 source with exactly three decoder chunks');
  const common=coder.decode(COMMON,chunks[0]);
  const specific=coder.decode(TYPE2,chunks[1]);
  const receipt=coder.decode(RECEIPT,chunks[2]);
  check(specific[0]===11155111n,'Wrong decoded source chain ID');
  check(common[3]===false,'Contract creation is not an eligible source action');
  check(common[5]===0n,'Source action must have zero value');
  check(receipt[0]===0n,'Verified source receipt did not fail');
  check(specific[4]===0n || specific[4]===1n,'Invalid type-2 signature parity');
  // Rebuild the signed source transaction, so the RPC hash is bound to all encoded
  // type-2 fields, rather than trusting the optional proof.txHash label.
  const signed=ethers.Transaction.from({type:2,chainId:specific[0],nonce:Number(common[0]),gasLimit:common[1],
    to:common[4],value:common[5],data:common[6],maxPriorityFeePerGas:specific[1],maxFeePerGas:specific[2],
    accessList:specific[3].map(entry=>({address:entry[0],storageKeys:[...entry[1]]})),
    signature:{yParity:Number(specific[4]),r:specific[5],s:specific[6]}});
  check(hexEqual(signed.from,common[2]),'Verified encoded sender differs from signed transaction sender');
  const source={chainKey:1n,chainId:specific[0],type:2,headerNumber:uint(proof.headerNumber,'headerNumber'),
    nonce:common[0],gasLimit:common[1],from:common[2],to:common[4],value:common[5],data:common[6],
    calldataHash:ethers.keccak256(common[6]),receiptStatus:0,receiptGasUsed:receipt[1],transactionHash:signed.hash};
  source.nullifier=ethers.keccak256(coder.encode(['uint64','address','uint64'],[source.chainKey,source.from,source.nonce]));
  return source;
}

function vaultEvents(logs, iface, vaultAddress, eventName) {
  return (logs || []).filter(log=>hexEqual(log.address,vaultAddress)).flatMap(log=>{
    try { const event=iface.parseLog(log); return event?.name===eventName ? [event] : []; }
    catch { return []; }
  });
}

function assertPublicEvidence({run,proof,nativeVerified,sourceTx,sourceReceipt,claimReceipt,ticketReceipt,
  storedTicket,issued,claimed,spent,owner,ticketBlock,sourceBlock,claimBlock,iface}) {
  const source=decodeVerifiedSource(proof,nativeVerified);
  // Loading the local ABI is optional for tests/callers that already hold an Interface.
  iface ||= new ethers.Interface(require('./common.cjs').artifact('GasBackVault').abi);
  check(sourceTx && sourceReceipt && claimReceipt && ticketReceipt,'Required public RPC transaction/receipt missing');
  check(Number(sourceReceipt.status)===0 && Number(claimReceipt.status)===1 && Number(ticketReceipt.status)===1,
    'Expected source failure and successful target receipts');
  check(hexEqual(source.transactionHash,run.sourceTxHash) && hexEqual(sourceTx.hash,run.sourceTxHash) &&
    hexEqual(hashOf(sourceReceipt),run.sourceTxHash) && (!proof.txHash || hexEqual(proof.txHash,run.sourceTxHash)),
    'Verified signed source hash differs from linked source transaction');
  check(uint(sourceTx.chainId,'RPC source chainId')===source.chainId && Number(sourceTx.type)===2 &&
    hexEqual(sourceTx.from,source.from) && hexEqual(sourceTx.to,source.to) &&
    uint(sourceTx.nonce,'RPC source nonce')===source.nonce && uint(sourceTx.gasLimit,'RPC source gasLimit')===source.gasLimit &&
    uint(sourceTx.value,'RPC source value')===source.value && hexEqual(sourceTx.data,source.data),
    'Verified source identity differs from RPC transaction');
  check(hexEqual(sourceReceipt.from,source.from) && hexEqual(sourceReceipt.to,source.to) &&
    uint(sourceReceipt.blockNumber,'source receipt block')===source.headerNumber &&
    uint(sourceTx.blockNumber,'source transaction block')===source.headerNumber &&
    uint(sourceReceipt.gasUsed,'source receipt gasUsed')===source.receiptGasUsed,
    'Verified source receipt identity, block or gas differs from RPC receipt');
  check(hexEqual(claimReceipt.to,run.vaultAddress) && hexEqual(ticketReceipt.to,run.vaultAddress),
    'Claim/ticket receipt destination is not the expected vault');
  check(hexEqual(hashOf(claimReceipt),run.claimTxHash) &&
    hexEqual(hashOf(ticketReceipt),hashOf(run.ticket?.receipt)) &&
    hexEqual(hashOf(ticketReceipt),run.ticket?.transactionHash), 'Target receipt transaction hash mismatch');
  check(hexEqual(ticketReceipt.from,owner),'Ticket receipt sender is not the on-chain vault owner');
  check(issued===true && claimed===true && spent===true,'Stored ticket/source consumed state is missing at the claim block');

  const ticket={};
  for (const field of TICKET_FIELDS) {
    const stored=storedTicket?.[field];
    ticket[field]=NUMERIC_TICKET_FIELDS.has(field) ? uint(stored,'stored ticket '+field) : stored;
    const recorded=run.ticket?.ticket?.[field];
    const equal=NUMERIC_TICKET_FIELDS.has(field) ? ticket[field]===uint(recorded,'manifest ticket '+field) : hexEqual(stored,recorded);
    check(equal,'Manifest ticket differs from stored ticket: '+field);
  }
  check(hexEqual(source.from,ticket.sourceSender) && hexEqual(source.to,ticket.sourceTarget) &&
    source.nonce===ticket.sourceNonce,'Stored ticket source identity does not match verified source');
  check(hexEqual(ticket.beneficiary,ticket.sourceSender) && !hexEqual(ticket.beneficiary,ethers.ZeroAddress) &&
    !hexEqual(ticket.sourceTarget,ethers.ZeroAddress) && ticket.rebate>0n && ticket.minGasLimit>0n,'Invalid stored sponsor ticket');
  check(source.gasLimit>=ticket.minGasLimit,'Verified source gas limit is below stored ticket minimum');
  check(hexEqual(source.calldataHash,ticket.calldataHash),'Verified exact calldata differs from stored ticket');
  check(source.headerNumber>=ticket.minSourceBlock && source.headerNumber<=ticket.maxSourceBlock,'Verified source block is outside stored ticket interval');
  check(uint(claimBlock?.timestamp,'claim block timestamp')<=ticket.claimDeadline &&
    uint(ticketBlock?.timestamp,'ticket block timestamp')<ticket.claimDeadline,'Claim/issuance timestamp violates stored ticket deadline');
  check(uint(ticketReceipt.blockNumber,'ticket receipt block')<=uint(claimReceipt.blockNumber,'claim receipt block'),
    'Ticket issuance occurs after the claim');
  check(sourceBlock && uint(sourceBlock.timestamp,'source block timestamp')>0n,'Source block timestamp missing');
  check(hexEqual(run.beneficiary,ticket.beneficiary) && uint(run.rebateWei,'manifest rebate')===ticket.rebate &&
    hexEqual(run.sourceContract,source.to) && hexEqual(run.ticket?.ticketId,run.ticketId) && hexEqual(run.ticket?.vault,run.vaultAddress),
    'Manifest payout/contract differs from stored ticket');

  const paidEvents=vaultEvents(claimReceipt.logs,iface,run.vaultAddress,'RebatePaid');
  const issuedEvents=vaultEvents(ticketReceipt.logs,iface,run.vaultAddress,'TicketIssued');
  check(paidEvents.length===1,'Expected exactly one vault RebatePaid event');
  const paidEvent=paidEvents[0];
  check(hexEqual(paidEvent.args.ticketId,run.ticketId) && hexEqual(paidEvent.args.nullifier,source.nullifier) &&
    hexEqual(paidEvent.args.beneficiary,ticket.beneficiary) && paidEvent.args.amount===ticket.rebate &&
    paidEvent.args.sourceBlock===source.headerNumber,'RebatePaid source/ticket/payment binding mismatch');
  check(issuedEvents.length===1,'Expected exactly one vault TicketIssued event');
  const issuedEvent=issuedEvents[0];
  check(hexEqual(issuedEvent.args.ticketId,run.ticketId) && hexEqual(issuedEvent.args.beneficiary,ticket.beneficiary) &&
    issuedEvent.args.rebate===ticket.rebate,'TicketIssued binding differs from stored ticket');
  return {source,ticket,nullifier:source.nullifier,paidEvent,issuedEvent};
}

module.exports={assertPublicEvidence,decodeVerifiedSource,vaultEvents,TICKET_FIELDS};
