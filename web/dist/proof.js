import {AbiCoder,keccak256} from './vendor/ethers.js';
const coder=AbiCoder.defaultAbiCoder();
export function isTxHash(value){return typeof value==='string' && /^0x[0-9a-fA-F]{64}$/.test(value);}
export function decodeAttestedTransaction(bytes){
 const [type,chunks]=coder.decode(['uint8','bytes[]'],bytes);
 if(type!==2n)throw new Error('GasBack supports only type-2 source transactions');
 if(chunks.length<3)throw new Error('Incomplete transaction encoding');
 const c=coder.decode(['uint64','uint64','address','bool','address','uint256','bytes'],chunks[0]);
 const r=coder.decode(['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'],chunks[chunks.length-1]);
 if(r[0]!==0n && r[0]!==1n)throw new Error('Invalid receipt status');
 return {type:2,nonce:c[0],gasLimit:c[1],sender:c[2],targetIsNull:c[3],target:c[4],value:c[5],data:c[6],status:Number(r[0]),gasUsed:r[1]};
}
export async function verifyAttestedProof(proof,verify){
 if(Number(proof?.chainKey)!==1)throw new Error('Only Sepolia proofs are supported');
 if(!Number.isSafeInteger(Number(proof.headerNumber)) || Number(proof.headerNumber)<0)throw new Error('Invalid source block number');
 if(await verify(proof)!==true)throw new Error('Native verifier rejected the proof');
 return decodeAttestedTransaction(proof.txBytes);
}
export function matchesTicket(tx,block,ticket){
 return tx.status===0 && ticket.beneficiary.toLowerCase()===tx.sender.toLowerCase() && ticket.sourceSender.toLowerCase()===tx.sender.toLowerCase() && ticket.sourceTarget.toLowerCase()===tx.target.toLowerCase() && ticket.sourceNonce===tx.nonce && ticket.calldataHash===keccak256(tx.data) && tx.value===0n && !tx.targetIsNull && tx.gasLimit>=ticket.minGasLimit && BigInt(block)>=ticket.minSourceBlock && BigInt(block)<=ticket.maxSourceBlock;
}
export function assertPaymentIdentity(tx,block,ticket,ticketId,event){
 const nullifier=keccak256(coder.encode(['uint64','address','uint64'],[1,tx.sender,tx.nonce]));
 if(!matchesTicket(tx,block,ticket)||event.ticketId.toLowerCase()!==ticketId.toLowerCase()||event.nullifier.toLowerCase()!==nullifier.toLowerCase()||event.beneficiary.toLowerCase()!==tx.sender.toLowerCase()||event.amount!==ticket.rebate||BigInt(event.sourceBlock)!==BigInt(block))throw new Error('Payment evidence does not match the failed transaction and sponsor ticket.');
}
