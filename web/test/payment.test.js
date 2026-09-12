import test from 'node:test';
import assert from 'node:assert/strict';
import {AbiCoder,keccak256} from '../dist/vendor/ethers.js';
import {assertPaymentIdentity} from '../dist/proof.js';
const address='0x1111111111111111111111111111111111111111';
const target='0x2222222222222222222222222222222222222222';
const id='0x'+'ab'.repeat(32),block=42;
const tx={status:0,sender:address,target,targetIsNull:false,nonce:12n,value:0n,gasLimit:100000n,data:'0x12345678'};
const ticket={beneficiary:address,sourceSender:address,sourceTarget:target,sourceNonce:12n,minSourceBlock:40n,maxSourceBlock:50n,minGasLimit:100000n,rebate:100n,calldataHash:keccak256(tx.data)};
const event={ticketId:id,beneficiary:address,sourceBlock:42n,amount:100n,nullifier:keccak256(AbiCoder.defaultAbiCoder().encode(['uint64','address','uint64'],[1,address,12]))};
test('completed-run evidence must bind the paid event to the exact failed transaction',()=>assert.doesNotThrow(()=>assertPaymentIdentity(tx,block,ticket,id,event)));
test('same-sender same-block successful transaction cannot borrow a failed-transaction payment',()=>assert.throws(()=>assertPaymentIdentity({...tx,status:1},block,ticket,id,event),/does not match/));
test('same-sender same-block different nonce cannot borrow the payment event',()=>assert.throws(()=>assertPaymentIdentity({...tx,nonce:13n},block,{...ticket,sourceNonce:13n},id,event),/does not match/));
test('amount and all source policy fields remain bound in completed evidence',()=>{
 for(const wrong of [{...event,amount:101n},{...event,sourceBlock:43n},{...event,ticketId:'0x'+'cd'.repeat(32)}])assert.throws(()=>assertPaymentIdentity(tx,block,ticket,id,wrong),/does not match/);
 for(const wrong of [{...tx,value:1n},{...tx,gasLimit:99999n},{...tx,data:'0x5678'},{...tx,targetIsNull:true}])assert.throws(()=>assertPaymentIdentity(wrong,block,ticket,id,event),/does not match/);
});
