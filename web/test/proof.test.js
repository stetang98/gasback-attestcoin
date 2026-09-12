import test from 'node:test';
import assert from 'node:assert/strict';
import {AbiCoder} from '../dist/vendor/ethers.js';
import {isTxHash, decodeAttestedTransaction, verifyAttestedProof} from '../dist/proof.js';
const coder = AbiCoder.defaultAbiCoder();
const sender='0x1111111111111111111111111111111111111111';
const target='0x2222222222222222222222222222222222222222';
function encoded(status=0,type=2){
 const common=coder.encode(['uint64','uint64','address','bool','address','uint256','bytes'],[12,180000,sender,false,target,0,'0x12345678']);
 const receipt=coder.encode(['uint8','uint64','tuple(address,bytes32[],bytes)[]','bytes'],[status,33000,[],'0x']);
 return coder.encode(['uint8','bytes[]'],[type,[common,'0x',receipt]]);
}
test('hash validation accepts exactly one complete transaction hash',()=>{
 assert.equal(isTxHash('0x'+'a'.repeat(64)),true);
 for(const value of ['0x123','javascript:alert(1)','0x'+'g'.repeat(64),'0x'+'a'.repeat(64)+'<'])assert.equal(isTxHash(value),false);
});
test('decode keeps receipt failure distinct from success and exposes proof-bound identity',()=>{
 const tx=decodeAttestedTransaction(encoded());
 assert.equal(tx.status,0);assert.equal(tx.nonce,12n);assert.equal(tx.sender.toLowerCase(),sender);assert.equal(tx.target.toLowerCase(),target);
 assert.equal(tx.data,'0x12345678');assert.equal(tx.gasUsed,33000n);
 assert.equal(decodeAttestedTransaction(encoded(1)).status,1);
});
test('unsupported source encoding fails closed',()=>assert.throws(()=>decodeAttestedTransaction(encoded(0,3)),/type-2/));
test('proof verifier rejection prevents decoding or accepting the claimed status',async()=>{
 await assert.rejects(verifyAttestedProof({chainKey:1,headerNumber:42,txBytes:encoded()},async()=>false),/rejected/);
 await assert.rejects(verifyAttestedProof({chainKey:1,headerNumber:42,txBytes:encoded()},async()=>{throw new Error('invalid Merkle proof')}),/invalid Merkle proof/);
});
test('wrong chain and malformed block never reach the verifier',async()=>{
 let invoked=false;const verify=async()=>{invoked=true;return true};
 await assert.rejects(verifyAttestedProof({chainKey:3,headerNumber:42,txBytes:encoded()},verify),/Sepolia/);
 await assert.rejects(verifyAttestedProof({chainKey:1,headerNumber:-1,txBytes:encoded()},verify),/block/);
 assert.equal(invoked,false);
});
test('valid proof is decoded only after the verifier confirms it',async()=>{
 const p={chainKey:1,headerNumber:42,txBytes:encoded()};
 let invoked=false;const result=await verifyAttestedProof(p,async(received)=>{assert.equal(received,p);invoked=true;return true});
 assert.equal(invoked,true);assert.equal(result.status,0);
});
