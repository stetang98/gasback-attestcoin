const { ethers, CHAIN, write, read, artifact, provider, signer, receipt, reportError } = require('./common.cjs');
async function main() {
  const p = await provider('target');
  const source = await provider('source');
  const wallet = signer(p);
  const balance = await p.getBalance(wallet.address);
  console.log(JSON.stringify({ chainId: CHAIN.target, address: wallet.address, testCtcBalance: ethers.formatEther(balance) }));
  if (balance < ethers.parseEther('11')) throw new Error('Need testnet faucet funds: 10 test CTC campaign budget plus gas');
  const sourceDeployment = read('source-deployment.json');
  if (!sourceDeployment) throw new Error('Run source deployment first');
  const a = artifact('GasBackVault');
  let deployment = read('target-deployment.json');
  if (!deployment) {
    let pending = read('target-deployment-pending.json');
    if (!pending) {
      const factory = new ethers.ContractFactory(a.abi, a.bytecode, wallet);
      const vault = await factory.deploy({ value: ethers.parseEther('10'), gasLimit: 4000000 });
      pending = { chainId: CHAIN.target, address: await vault.getAddress(), transactionHash: vault.deploymentTransaction().hash };
      write('target-deployment-pending.json', pending);
      console.log(JSON.stringify({ targetDeploymentSent: pending }));
    }
    const r = await p.waitForTransaction(pending.transactionHash, 1, 180000);
    if (!r || r.status !== 1) throw new Error('Target deployment failed or pending');
    deployment = { observedAt: new Date().toISOString(), chainId: CHAIN.target, address: pending.address,
      owner: wallet.address, initialBudget: ethers.parseEther('10').toString(), asset: 'test CTC', receipt: receipt(r),
      codeHash: ethers.keccak256(await p.getCode(pending.address)),
      explorer: `https://creditcoin-testnet.blockscout.com/address/${pending.address}` };
    write('target-deployment.json', deployment);
  }
  const vault = new ethers.Contract(deployment.address, a.abi, wallet);
  if (await vault.owner() !== wallet.address) throw new Error('Vault owner mismatch');
  let ticketEvidence = read('ticket.json');
  if (!ticketEvidence) {
    let pending = read('ticket-pending.json');
    if (!pending) {
      const latestSource = await source.getBlockNumber();
      const latestTarget = await p.getBlock('latest');
      const sourceNonce = await source.getTransactionCount(wallet.address, 'pending');
      const intent = ethers.id('GasBack prospective live rebate 2026-09-12 v1');
      const sourceData = new ethers.Interface(artifact('DemoAction').abi).encodeFunctionData('fail', [intent]);
      const ticketId = ethers.id('GasBack prospective ticket 2026-09-12 v1');
      const ticket = { beneficiary: wallet.address, sourceSender: wallet.address, sourceTarget: sourceDeployment.address,
        sourceNonce, minSourceBlock: latestSource + 1, maxSourceBlock: latestSource + 7200,
        claimDeadline: latestTarget.timestamp + 86400, minGasLimit: 100000,
        rebate: ethers.parseEther('1').toString(), calldataHash: ethers.keccak256(sourceData) };
      const tx = await vault.issueTicket(ticketId, ticket, { gasLimit: 650000 });
      pending = { ticketId, ticket, intent, sourceData, transactionHash: tx.hash,
        sourceHeadAtAuthorizationSubmission: latestSource, sourceNonceBeforeAuthorization: sourceNonce };
      write('ticket-pending.json', pending);
      console.log(JSON.stringify({ ticketSent: tx.hash, ticketId }));
    }
    const r = await p.waitForTransaction(pending.transactionHash, 1, 180000);
    if (!r || r.status !== 1 || !await vault.issued(pending.ticketId)) throw new Error('Ticket authorization not confirmed');
    ticketEvidence = { observedAt: new Date().toISOString(), chainId: CHAIN.target, vault: deployment.address, ...pending,
      authorizationOrder: 'Target ticket confirmed before source transaction broadcast.', receipt: receipt(r),
      sourceHeadAfterAuthorization: await source.getBlockNumber(),
      explorer: `https://creditcoin-testnet.blockscout.com/tx/${r.hash}` };
    write('ticket.json', ticketEvidence);
  }
  console.log(JSON.stringify({ targetReady: deployment.address, ticketId: ticketEvidence.ticketId, authorized: true }));
  p.destroy(); source.destroy();
}
main().catch(reportError);
