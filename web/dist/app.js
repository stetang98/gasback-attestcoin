import {JsonRpcProvider,Contract,BrowserProvider,formatEther,keccak256,getAddress} from './vendor/ethers.js';
import {isTxHash,verifyAttestedProof,matchesTicket,assertPaymentIdentity} from './proof.js';
const RPC='https://rpc.cc3-testnet.creditcoin.network';
const PROVER='https://prover.cc3-testnet.creditcoin.network';
const SOURCE_RPC='https://ethereum-sepolia-rpc.publicnode.com';
const PRECOMPILE='0x0000000000000000000000000000000000000FD2';
const HISTORICAL='0x736afe589dcc92742c9a5fd78cdbbd14b141349b5d656f4493f1688da7957b5e';
const CC_EXPLORER='https://creditcoin-testnet.blockscout.com';
const $=id=>document.getElementById(id);
let run=null,proof=null,decoded=null,activeHash='',activeTicket='',eligible=false,busy=false,signer=null,walletEpoch=0;
const cc=new JsonRpcProvider(RPC,102031,{staticNetwork:true});
const source=new JsonRpcProvider(SOURCE_RPC,11155111,{staticNetwork:true});
async function json(url){const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw new Error('Request failed ('+r.status+'). The proof may still be awaiting attestation.');return r.json();}
const abis=Promise.all([json('./vendor/block-prover-abi.json'),json('./vendor/GasBackVault.json')]);
function notice(message,kind=''){$('notice').textContent=message;$('notice').className='notice '+kind;}
function step(id,state,label){const el=$('step-'+id);el.className=state;el.querySelector('.state-pill').textContent=label;}
function amount(value){const node=$('rebate-amount');node.replaceChildren(document.createTextNode(value+' '));const unit=document.createElement('span');unit.textContent='test CTC';node.append(unit);}
function link(id,url){$(id).href=url;$(id).hidden=false;}
function fields(values){$('verified-fields').replaceChildren(...Object.entries(values).map(([name,value])=>{const row=document.createElement('div'),key=document.createElement('dt'),val=document.createElement('dd');key.textContent=name;val.textContent=String(value);row.append(key,val);return row;}));}
function reset(){proof=null;decoded=null;eligible=false;activeHash='';activeTicket='';$('claim-button').disabled=true;$('claim-button').textContent='Verify a transaction first';$('receipt-status').textContent='AWAITING EVIDENCE';for(const id of ['source','proof'])step(id,'','Not checked');step('rebate','','No claim');$('source-tx-link').hidden=true;$('claim-tx-link').hidden=true;amount('—');$('rebate-detail').textContent='Released when the ticket and proof match.';$('rebate-caption').textContent="A proof verifies facts. A sponsor ticket determines eligibility.";fields({Status:'No verified data yet'});}
function lock(value){busy=value;$('verify-button').disabled=value;$('sample-button').disabled=value;$('load-run').disabled=value;$('connect-wallet').disabled=value;$('tx-hash').disabled=value;$('ticket-id').disabled=value;$('verify-button').setAttribute('aria-busy',String(value));$('verify-button').textContent=value?'Checking on-chain…':'Verify with Attestcoin';}
function reason(error){if(error.code==='ACTION_REJECTED'||error.code===4001)return 'Wallet request cancelled. No new claim was sent.';if(error.name==='TimeoutError')return 'The network took too long. Try again shortly.';return (error.reason||error.shortMessage||error.message||'Verification failed').slice(0,260);}
function args(){return [activeTicket,proof.chainKey,proof.headerNumber,proof.txBytes,proof.merkleProof,proof.continuityProof];}
async function vault(readOnly=true){if(!run?.vaultAddress)throw new Error('No deployed campaign is configured yet. Proof checks are still available.');const [,artifact]=await abis;return new Contract(run.vaultAddress,artifact.abi,readOnly?cc:signer);}
async function verify(hash,ticket=''){
 if(busy)throw new Error('A check is already running.');
 reset();
 if(!isTxHash(hash))throw new Error('Enter a complete 0x transaction hash (64 hexadecimal characters).');
 if(ticket&&!isTxHash(ticket))throw new Error('A sponsor ticket must be a complete bytes32 ID.');
 lock(true);notice('Fetching the source proof. New transactions may need several minutes for attestation.');
 try{
  const p=await json(PROVER+'/api/v1/proof-by-tx/1/'+hash);
  const [abi]=await abis;const verifier=new Contract(PRECOMPILE,abi,cc);
  notice('Checking the proof with Creditcoin’s native verifier…');
  const tx=await verifyAttestedProof(p,q=>verifier['verify(uint64,uint64,bytes,(bytes32,(bytes32,bool)[]),(bytes32,bytes32[]))'].staticCall(q.chainKey,q.headerNumber,q.txBytes,q.merkleProof,q.continuityProof));
  const [rpcTx,rpcReceipt]=await Promise.all([source.getTransaction(hash),source.getTransactionReceipt(hash)]);
  if(!rpcTx||!rpcReceipt)throw new Error('Source transaction receipt is not available.');
  if(rpcTx.from.toLowerCase()!==tx.sender.toLowerCase()||rpcTx.to?.toLowerCase()!==tx.target.toLowerCase()||BigInt(rpcTx.nonce)!==tx.nonce||rpcTx.data!==tx.data||rpcTx.value!==tx.value||rpcTx.gasLimit!==tx.gasLimit||rpcReceipt.status!==tx.status||rpcReceipt.gasUsed!==tx.gasUsed||rpcReceipt.blockNumber!==Number(p.headerNumber)||rpcTx.chainId!==11155111n)throw new Error('The requested hash does not match the proof-bound source transaction.');
  proof=p;decoded=tx;activeHash=hash;activeTicket=ticket;
  step('proof','ok','Verified');step('source',tx.status===0?'ok':'bad',tx.status===0?'Failed · status 0':'Succeeded · status 1');link('source-tx-link','https://sepolia.etherscan.io/tx/'+hash);
  fields({'Receipt status':tx.status,'Source block':p.headerNumber,'Sender':tx.sender,'Target':tx.target,'Nonce':tx.nonce,'Gas limit':tx.gasLimit,'Gas used':tx.gasUsed,'Native value':tx.value,'Input hash':keccak256(tx.data),'Verifier':PRECOMPILE});
  $('receipt-status').textContent='PROOF VERIFIED';
  if(tx.status!==0){$('claim-button').textContent='Successful transactions are ineligible';notice('Proof verified. This transaction succeeded, so it cannot receive a failure rebate.','error');return {verified:true,status:tx.status,eligible:false};}
  if(!ticket){$('claim-button').textContent='A sponsor ticket is required';notice('Failed receipt verified on Creditcoin. Add a preauthorized ticket to check rebate eligibility.','success');return {verified:true,status:0,eligible:false};}
  await checkTicket();return {verified:true,status:0,eligible};
 }catch(error){if(!proof){step('proof','bad','Not verified');$('receipt-status').textContent='CHECK INCOMPLETE';}throw error;}finally{lock(false);}
}
async function checkTicket(){
 const v=await vault();const [issued,claimed,t]=await Promise.all([v.issued(activeTicket),v.claimed(activeTicket),v.tickets(activeTicket)]);
 if(!issued)throw new Error('This ticket was not issued by the configured sponsor.');
 const policyMatches=matchesTicket(decoded,proof.headerNumber,t);
 if(!policyMatches)throw new Error('Verified failure does not match this sponsor ticket.');
 if(claimed){step('rebate','ok','Ticket consumed');$('claim-button').textContent='Already claimed · replay blocked';$('rebate-caption').textContent='This ticket has already been consumed. A second payment is prohibited.';notice('Proof verified. This matching ticket has already been used.','success');return;}
 await v.claim.staticCall(...args());
 eligible=true;amount(formatEther(t.rebate));step('rebate','','Eligible');$('rebate-caption').textContent='Fixed sponsor rebate. Eligibility passed an on-chain simulation; payment still requires a mined claim.';$('claim-button').disabled=false;$('claim-button').textContent='Claim '+formatEther(t.rebate)+' test CTC';notice('Proof and sponsor policy verified. You can now submit the claim.','success');
}
async function connect(){
 if(!window.ethereum)throw new Error('Open this page in a browser with an Ethereum-compatible wallet to submit a claim. Read-only verification works here.');
 const provider=new BrowserProvider(window.ethereum);
 await provider.send('eth_requestAccounts',[]);
 try{await provider.send('wallet_switchEthereumChain',[{chainId:'0x18e8f'}]);}catch(error){if(error.code!==4902&&error.info?.error?.code!==4902)throw error;await provider.send('wallet_addEthereumChain',[{chainId:'0x18e8f',chainName:'Creditcoin Testnet',nativeCurrency:{name:'Test CTC',symbol:'tCTC',decimals:18},rpcUrls:[RPC],blockExplorerUrls:[CC_EXPLORER]}]);}
 const fresh=new BrowserProvider(window.ethereum);if((await fresh.getNetwork()).chainId!==102031n)throw new Error('Switch your wallet to Creditcoin testnet.');
 signer=await fresh.getSigner();const address=await signer.getAddress();$('connect-wallet').textContent=address.slice(0,6)+'…'+address.slice(-4);return signer;
}
async function claim(){
 if(busy||!eligible||!proof)return;
 lock(true);$('claim-button').disabled=true;let hash;
 try{await connect();const epoch=walletEpoch;const v=await vault(false);await v.claim.staticCall(...args());if(epoch!==walletEpoch)throw new Error('Wallet changed during validation. Verify again before claiming.');notice('Confirm the fixed rebate claim in your wallet.');const tx=await v.claim(...args(),{chainId:102031n});hash=tx.hash;notice('Claim submitted. Waiting for the Creditcoin receipt…');let mined;try{mined=await tx.wait();}catch(error){const replacement=error.replacement;if(error.code!=='TRANSACTION_REPLACED'||error.cancelled||!replacement||replacement.to?.toLowerCase()!==tx.to?.toLowerCase()||replacement.from?.toLowerCase()!==tx.from?.toLowerCase()||replacement.data!==tx.data||replacement.value!==tx.value||replacement.nonce!==tx.nonce)throw error;mined=error.receipt||await replacement.wait();hash=mined.hash;}const receipt=await cc.getTransactionReceipt(mined.hash);if(!receipt)throw new Error('Payment receipt is awaiting confirmation from Creditcoin.');if(receipt.status!==1)throw new Error('The claim reverted. No rebate was paid.');eligible=false;await verifyPayment(receipt);$('claim-button').textContent='Rebate paid · replay blocked';notice('Rebate paid on Creditcoin. This ticket cannot be used again.','success');}catch(error){if(!hash&&isTxHash(error.info?.sendTransactionHash))hash=error.info.sendTransactionHash;if(hash){eligible=false;$('claim-button').textContent='Verify again before retrying';link('claim-tx-link',CC_EXPLORER+'/tx/'+hash);}notice(reason(error)+(hash?' Transaction: '+hash:''),'error');}finally{lock(false);$('claim-button').disabled=!eligible;}
}
async function verifyPayment(receipt){
 const v=await vault();let payment=null;
 for(const log of receipt.logs){if(log.address.toLowerCase()!==run.vaultAddress.toLowerCase())continue;try{const event=v.interface.parseLog(log);if(event?.name==='RebatePaid'&&event.args.ticketId.toLowerCase()===activeTicket.toLowerCase())payment=event;}catch{}}
 if(receipt.status!==1||!payment||!decoded||!proof||!await v.claimed(activeTicket))throw new Error('Payment evidence does not match this verified source and ticket.');
 const ticket=await v.tickets(activeTicket);
 assertPaymentIdentity(decoded,proof.headerNumber,ticket,activeTicket,payment.args);
 amount(formatEther(payment.args.amount));step('rebate','ok','Paid on-chain');link('claim-tx-link',CC_EXPLORER+'/tx/'+receipt.hash);$('receipt-status').textContent='REBATE PAID';$('rebate-detail').textContent='Fixed subsidy delivered to the ticket beneficiary.';$('rebate-caption').textContent='Payment confirmed by the vault event and consumed ticket state. Displayed evidence is a completed testnet run.';$('claim-button').disabled=true;$('claim-button').textContent='Rebate paid · replay blocked';
}
async function loadRun(){
 if(!run||busy)return;
 $('tx-hash').value=run.sourceTxHash;$('ticket-id').value=run.ticketId;
 try{const result=await verify(run.sourceTxHash,run.ticketId);if(!proof||result.status!==0)throw new Error('The recorded demonstration must prove a failed transaction.');lock(true);$('claim-button').disabled=true;notice('Proof verified. Checking the recorded payment on Creditcoin…');const receipt=await cc.getTransactionReceipt(run.claimTxHash);if(!receipt)throw new Error('The recorded claim receipt is unavailable.');await verifyPayment(receipt);eligible=false;notice('Completed run verified: real failed source, native proof, and recorded sponsor payment. No new transaction was sent.','success');$('evidence').scrollIntoView({behavior:'smooth'});}catch(error){notice(reason(error),'error');}finally{lock(false);$('claim-button').disabled=!eligible;}
}
$('verify-form').addEventListener('submit',async event=>{event.preventDefault();try{await verify($('tx-hash').value.trim(),$('ticket-id').value.trim());if(proof)$('evidence').scrollIntoView({behavior:'smooth'});}catch(error){notice(reason(error),'error');}});
$('sample-button').addEventListener('click',async()=>{if(run)return loadRun();$('tx-hash').value=HISTORICAL;$('ticket-id').value='';try{await verify(HISTORICAL);if(proof)$('evidence').scrollIntoView({behavior:'smooth'});}catch(error){notice(reason(error),'error');}});
for(const id of ['tx-hash','ticket-id'])$(id).addEventListener('input',()=>{reset();notice('Input changed. Verify again to check the new evidence.');});
$('connect-wallet').addEventListener('click',()=>connect().then(()=>notice('Wallet connected to Creditcoin testnet.')).catch(error=>notice(reason(error),'error')));
$('claim-button').addEventListener('click',claim);$('load-run').addEventListener('click',loadRun);
window.ethereum?.on?.('accountsChanged',()=>{walletEpoch++;signer=null;$('connect-wallet').textContent='Connect wallet';});
window.ethereum?.on?.('chainChanged',()=>{walletEpoch++;signer=null;$('connect-wallet').textContent='Connect wallet';});
try{const candidate=await json('./evidence/run.json');if(isTxHash(candidate.sourceTxHash)&&isTxHash(candidate.ticketId)&&isTxHash(candidate.claimTxHash)&&getAddress(candidate.vaultAddress)){run=candidate;$('live-run-panel').hidden=false;$('run-description').textContent='A published testnet run. Recheck its proof and payment directly against both chains.';$('sample-button').textContent='Explore the completed demo';$('sample-note').textContent='Real failed transaction, verified proof, recorded testnet payout.';if(candidate.repoURL?.startsWith('https://github.com/'))link('source-link',candidate.repoURL);}}catch{}
if(document.modelContext?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{await document.modelContext.registerTool({name:'verify_sepolia_failure',description:'Read-only: fetch a Sepolia transaction proof and check it with Creditcoin native verifier. Updates the visible proof trail; never connects a wallet or sends a transaction.',inputSchema:{type:'object',properties:{txHash:{type:'string',pattern:'^0x[0-9a-fA-F]{64}$'}},required:['txHash'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:async input=>{if(busy)throw new Error('A check is already running.');if(!input||Object.keys(input).length!==1||!isTxHash(input.txHash))throw new Error('Invalid transaction hash');$('tx-hash').value=input.txHash;$('ticket-id').value='';try{return await verify(input.txHash);}catch(error){notice(reason(error),'error');throw error;}}},{signal:lifecycle.signal});}catch(error){console.warn('Optional WebMCP registration unavailable:',error.message);}}

