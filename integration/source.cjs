const { ethers, CHAIN, write, read, artifact, provider, signer, receipt, reportError } = require('./common.cjs');
async function main() {
  const p = await provider('source');
  const wallet = signer(p);
  const balance = await p.getBalance(wallet.address);
  console.log(JSON.stringify({ chainId: CHAIN.source, address: wallet.address, testEthBalance: ethers.formatEther(balance) }));
  if (balance === 0n) throw new Error('Sepolia faucet funding not yet received');
  const a = artifact('DemoAction');
  let deployment = read('source-deployment.json');
  if (!deployment) {
    let pending = read('source-deployment-pending.json');
    if (!pending) {
      const factory = new ethers.ContractFactory(a.abi, a.bytecode, wallet);
      const contract = await factory.deploy({ type: 2, value: 0, gasLimit: 400000 });
      const tx = contract.deploymentTransaction();
      pending = { chainId: CHAIN.source, transactionHash: tx.hash, address: await contract.getAddress() };
      write('source-deployment-pending.json', pending);
    }
    const r = await p.waitForTransaction(pending.transactionHash, 1, 180000);
    if (!r || r.status !== 1) throw new Error('Source deployment failed or is not mined');
    deployment = { observedAt: new Date().toISOString(), chainId: CHAIN.source, address: pending.address,
      deployer: wallet.address, receipt: receipt(r), explorer: `https://sepolia.etherscan.io/address/${pending.address}` };
    write('source-deployment.json', deployment);
    console.log(JSON.stringify({ deployedSource: deployment.address, deploymentTx: r.hash }));
  }
  if (await p.getCode(deployment.address) === '0x') throw new Error('Source deployment has no code');
  console.log(JSON.stringify({ sourceReady: deployment.address, nextSourceNonce: await p.getTransactionCount(wallet.address, 'pending') }));
  p.destroy();
}
main().catch(reportError);
