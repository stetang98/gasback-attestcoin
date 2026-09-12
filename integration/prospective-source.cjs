const { ethers, CHAIN, write, read, artifact, provider, signer, waitEvenIfReverted, receipt, reportError } = require('./common.cjs');
async function main() {
  const p = await provider('source');
  const cc = await provider('target');
  const wallet = signer(p);
  const ticketEvidence = read('ticket.json');
  if (!ticketEvidence || ticketEvidence.receipt.status !== 1) throw new Error('Target authorization must be confirmed before source failure');
  const vault = new ethers.Contract(ticketEvidence.vault, artifact('GasBackVault').abi, cc);
  if (!await vault.issued(ticketEvidence.ticketId) || await vault.claimed(ticketEvidence.ticketId)) throw new Error('Ticket absent or consumed');
  const t = ticketEvidence.ticket;
  let failure = read('source-failure.json');
  if (!failure) {
    let pending = read('source-failure-pending.json');
    if (!pending) {
      const nonce = await p.getTransactionCount(wallet.address, 'pending');
      if (nonce !== Number(t.sourceNonce)) throw new Error('Source nonce changed since authorization');
      if (await p.getBlockNumber() >= Number(t.maxSourceBlock)) throw new Error('Source ticket block interval expired');
      const tx = await wallet.sendTransaction({ to: t.sourceTarget, data: ticketEvidence.sourceData,
        nonce, type: 2, value: 0, gasLimit: 100000 });
      pending = { chainId: CHAIN.source, transactionHash: tx.hash, nonce, data: ticketEvidence.sourceData, intent: ticketEvidence.intent };
      write('source-failure-pending.json', pending);
      console.log(JSON.stringify({ prospectiveSourceFailureSent: tx.hash, nonce }));
    }
    const tx = await p.getTransaction(pending.transactionHash);
    if (!tx) throw new Error('Source transaction not visible yet');
    const r = await waitEvenIfReverted(tx);
    if (!r || r.status !== 0 || tx.type !== 2 || tx.value !== 0n) throw new Error('Expected type-2 zero-value real source failure');
    if (r.blockNumber < Number(t.minSourceBlock) || r.blockNumber > Number(t.maxSourceBlock)) throw new Error('Failure outside authorized source block interval');
    failure = { observedAt: new Date().toISOString(), chainId: CHAIN.source, chainKey: 1,
      fixtureType: 'prospective-ticket-live-testnet-demo', authorizationOrder: 'Ticket mined on Creditcoin before source transaction broadcast.',
      ticketId: ticketEvidence.ticketId, authorizationTransaction: ticketEvidence.receipt.transactionHash,
      sender: wallet.address, target: t.sourceTarget, nonce: pending.nonce, type: 2, value: '0', gasLimit: tx.gasLimit.toString(),
      intent: pending.intent, data: tx.data, calldataHash: ethers.keccak256(tx.data), receipt: receipt(r),
      explorer: `https://sepolia.etherscan.io/tx/${r.hash}` };
    write('source-failure.json', failure);
  }
  console.log(JSON.stringify({ sourceFailureTx: failure.receipt.transactionHash, sourceBlock: failure.receipt.blockNumber, status: failure.receipt.status, ticketId: failure.ticketId }));
  p.destroy(); cc.destroy();
}
main().catch(reportError);
