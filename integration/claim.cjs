const { ethers, write, read, artifact, provider, signer, receipt, reportError } = require('./common.cjs');
const { prepareProof } = require('./proof.cjs');
async function main() {
  const ticket = read('ticket.json');
  const deployment = read('target-deployment.json');
  if (!ticket || !deployment) throw new Error('Confirmed target deployment and ticket are required');
  const proof = read('source-proof.json') || await prepareProof({ wait: process.argv.includes('--wait') });
  const p = await provider('target');
  try {
    const wallet = signer(p);
    const vault = new ethers.Contract(deployment.address, artifact('GasBackVault').abi, wallet);
    const args = [ticket.ticketId, proof.chainKey, proof.headerNumber, proof.txBytes, proof.merkleProof, proof.continuityProof];
    let claim = read('claim.json');
    if (!claim) {
      let pending = read('claim-pending.json');
      if (!pending) {
        const rejected = [];
        for (const [name, attempt, expected] of [
          ['wrong source chain', [args[0], 3, ...args.slice(2)], 'WrongSourceChain'],
          ['unissued ticket', [ethers.id('GasBack deliberately unissued negative-control ticket'), ...args.slice(1)], 'TicketNotIssued']
        ]) {
          try { await vault.claim.staticCall(...attempt); throw new Error(`${name} was unexpectedly accepted`); }
          catch (error) {
            let decoded;
            try { decoded = vault.interface.parseError(error.data || error.info?.error?.data); } catch {}
            if (decoded?.name !== expected) throw new Error(`${name}: expected ${expected}; got ${error.shortMessage || error.message}`);
            rejected.push({ test: name, rejected: true, errorName: decoded.name, mode: 'read-only eth_call' });
          }
        }
        write('preclaim-rejections.json', { observedAt: new Date().toISOString(), cases: rejected });
        await vault.claim.staticCall(...args);
        const balanceBefore = await p.getBalance(deployment.address);
        const totalPaidBefore = await vault.totalPaid();
        const tx = await vault.claim(...args, { gasLimit: 1800000 });
        pending = { transactionHash: tx.hash, vaultBalanceBefore: balanceBefore.toString(), totalPaidBefore: totalPaidBefore.toString() };
        write('claim-pending.json', pending);
        console.log(JSON.stringify({ claimSent: tx.hash }));
      }
      const r = await p.waitForTransaction(pending.transactionHash, 1, 180000);
      if (!r || r.status !== 1) throw new Error('Claim not confirmed successful');
      const event = r.logs.map(l => { try { return vault.interface.parseLog(l); } catch { return null; } }).find(l => l && l.name === 'RebatePaid');
      if (!event || !await vault.claimed(ticket.ticketId)) throw new Error('Successful receipt lacks expected rebate event/state');
      claim = { observedAt: new Date().toISOString(), chainId: 102031, asset: 'test CTC', vault: deployment.address,
        ticketId: ticket.ticketId, sourceTransaction: read('source-failure.json').receipt.transactionHash,
        beneficiary: event.args.beneficiary, amount: event.args.amount.toString(), sourceBlock: Number(event.args.sourceBlock),
        nullifier: event.args.nullifier, receipt: receipt(r), ...pending,
        vaultBalanceAfter: (await p.getBalance(deployment.address)).toString(), totalPaidAfter: (await vault.totalPaid()).toString(),
        explorer: `https://creditcoin-testnet.blockscout.com/tx/${r.hash}` };
      write('claim.json', claim);
    }
    let rejection;
    try { await vault.claim.staticCall(...args); throw new Error('Duplicate claim unexpectedly succeeded'); }
    catch (error) {
      let decoded;
      try { decoded = vault.interface.parseError(error.data || error.info?.error?.data); } catch {}
      if (decoded?.name !== 'TicketAlreadyClaimed') throw new Error(`Duplicate check returned unexpected error: ${error.shortMessage || error.message}`);
      rejection = { observedAt: new Date().toISOString(), mode: 'read-only eth_call, no second payout transaction',
        ticketId: ticket.ticketId, rejected: true, errorName: decoded.name, errorData: error.data,
        totalPaidAfterAttempt: (await vault.totalPaid()).toString(), vaultBalanceAfterAttempt: (await p.getBalance(deployment.address)).toString() };
    }
    write('duplicate-rejection.json', rejection);
    console.log(JSON.stringify({ claimVerified: true, claimTransaction: claim.receipt.transactionHash,
      rebateTestCtc: ethers.formatEther(claim.amount), duplicateRejected: rejection.rejected }));
  } finally { p.destroy(); }
}
main().catch(reportError);
