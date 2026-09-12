const { read, write, RPC, CHAIN } = require('./common.cjs');
function normalize() {
  const sourceDeployment = read('source-deployment.json');
  const sourceFailure = read('source-failure.json');
  const targetDeployment = read('target-deployment.json');
  const ticket = read('ticket.json');
  const proofVerification = read('proof-verification.json');
  const claim = read('claim.json');
  const duplicateRejection = read('duplicate-rejection.json');
  const status = claim && duplicateRejection?.rejected ? 'completed-live-testnet-rebate' :
    claim ? 'claimed-awaiting-replay-check' : proofVerification?.verified ? 'proof-verified-awaiting-claim' :
    sourceFailure ? 'source-failed-awaiting-attestation' : ticket ? 'ticket-authorized-awaiting-source' :
    targetDeployment ? 'vault-deployed-awaiting-ticket' : sourceDeployment ? 'source-deployed-awaiting-target-funding' : 'not-deployed';
  const run = {
    schemaVersion: 1, project: 'GasBack', generatedAt: new Date().toISOString(), status,
    repoURL: 'https://github.com/stetang98/gasback-attestcoin',
    networkMode: 'testnet-only',
    networks: { source: { name: 'Ethereum Sepolia', chainId: CHAIN.source, chainKey: 1, rpc: RPC.source },
      target: { name: 'Creditcoin Testnet', chainId: CHAIN.target, rpc: RPC.target } },
    vaultAddress: targetDeployment?.address || null,
    sourceContract: sourceDeployment?.address || null,
    sourceTxHash: sourceFailure?.receipt.transactionHash || null,
    ticketId: ticket?.ticketId || null,
    claimTxHash: claim?.receipt.transactionHash || null,
    beneficiary: ticket?.ticket.beneficiary || null,
    rebateWei: ticket?.ticket.rebate || null,
    asset: 'test CTC',
    proofVerified: proofVerification?.verified === true,
    duplicateRejected: duplicateRejection?.rejected === true,
    sourceDeployment, sourceFailure, targetDeployment, ticket, proofVerification, claim, duplicateRejection,
    proofFile: proofVerification?.verified ? 'source-proof.json' : null,
    evidenceBoundary: 'Historical replay of the explicitly linked live testnet transactions. Null steps have not completed. Native eth_call checks are not mined payout transactions.'
  };
  write('run.json', run);
  console.log(JSON.stringify({ status, sourceTxHash: run.sourceTxHash, claimTxHash: run.claimTxHash }));
  return run;
}
module.exports = { normalize };
if (require.main === module) normalize();
