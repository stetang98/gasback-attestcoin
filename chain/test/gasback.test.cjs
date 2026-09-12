const assert = require('node:assert/strict');
const { test, before } = require('node:test');
// Ganache's bundled native transport is unavailable on recent Node versions.
// Choose its supported JavaScript transport explicitly; no network server is opened.
process.env.UWS_USE_FALLBACK = 'true';
const ganache = require('ganache');
const { AbiCoder, BrowserProvider, Contract, ContractFactory, ZeroHash, id, keccak256, parseEther } = require('ethers');
const { compile } = require('../scripts/compile.cjs');

const PRECOMPILE = '0x0000000000000000000000000000000000000FD2';
const coder = AbiCoder.defaultAbiCoder();
const merkleType = 'tuple(bytes32 root,tuple(bytes32 hash,bool isLeft)[] siblings)';
const continuityType = 'tuple(bytes32 lowerEndpointDigest,bytes32[] roots)';
const proofTypes = ['uint64', 'uint64', 'bytes', merkleType, continuityType];
const rebate = parseEther('0.01');
let artifacts;
before(() => { artifacts = compile({ includeTests: true }); });

async function sent(promise) { return (await promise).wait(); }
async function fixture(t, { funds = parseEther('1'), recipient = false } = {}) {
  const rpc = ganache.provider({ logging: { quiet: true }, wallet: { totalAccounts: 4 }, chain: { chainId: 102031, hardfork: 'shanghai' } });
  t.after(async () => { provider.destroy(); await rpc.disconnect(); });
  const provider = new BrowserProvider(rpc, undefined, { cacheTimeout: -1 });
  provider.pollingInterval = 10;
  const [owner, user, relayer] = await Promise.all([0, 1, 2].map(i => provider.getSigner(i)));
  async function deploy(name, options = {}) {
    const a = artifacts[name];
    const contract = await new ContractFactory(a.abi, a.bytecode, owner).deploy(options);
    await contract.waitForDeployment();
    return contract;
  }
  await rpc.request({ method: 'evm_setAccountCode', params: [PRECOMPILE, artifacts.VerifierHarness.deployedBytecode] });
  const verifier = new Contract(PRECOMPILE, artifacts.VerifierHarness.abi, owner);
  const vault = await deploy('GasBackVault', { value: funds });
  const action = await deploy('DemoAction');
  const recipientContract = recipient ? await deploy('PaymentRecipient') : null;
  const beneficiary = recipientContract ? await recipientContract.getAddress() : await user.getAddress();
  const intent = id('sponsor-approved-demo-intent');
  const data = action.interface.encodeFunctionData('fail', [intent]);
  const now = (await provider.getBlock('latest')).timestamp;
  const ticket = {
    beneficiary, sourceSender: beneficiary, sourceTarget: await action.getAddress(),
    sourceNonce: 7n, minSourceBlock: 100n, maxSourceBlock: 120n,
    claimDeadline: BigInt(now + 3600), minGasLimit: 80000n, rebate, calldataHash: keccak256(data),
  };
  const tx = {
    type: 2, nonce: 7n, gasLimit: 100000n, from: beneficiary, toIsNull: false,
    to: await action.getAddress(), value: 0n, data, chainId: 11155111n, status: 0,
  };
  function encode(overrides = {}) {
    const v = { ...tx, ...overrides };
    const chunks = [
      coder.encode(['uint64', 'uint64', 'address', 'bool', 'address', 'uint256', 'bytes'], [v.nonce, v.gasLimit, v.from, v.toIsNull, v.to, v.value, v.data]),
      coder.encode(['uint64', 'uint128', 'uint128', 'tuple(address,bytes32[])[]', 'uint8', 'bytes32', 'bytes32'], [v.chainId, 1n, 10n, [], 0, ZeroHash, ZeroHash]),
      coder.encode(['uint8', 'uint64', 'tuple(address,bytes32[],bytes)[]', 'bytes'], [v.status, 25000n, [], `0x${'00'.repeat(256)}`]),
    ];
    return coder.encode(['uint8', 'bytes[]'], [v.type, chunks]);
  }
  function proof(overrides = {}) {
    return { chainKey: 1n, headerNumber: 110n, encodedTransaction: encode(),
      merkleProof: { root: id('root'), siblings: [{ hash: id('sibling'), isLeft: false }] },
      continuityProof: { lowerEndpointDigest: id('endpoint'), roots: [id('continuity')] }, ...overrides };
  }
  const args = p => [p.chainKey, p.headerNumber, p.encodedTransaction, p.merkleProof, p.continuityProof];
  async function authorize(p) { await sent(verifier.authorize(keccak256(coder.encode(proofTypes, args(p))))); }
  async function issue(ticketId = id('ticket-1'), overrides = {}) { await sent(vault.issueTicket(ticketId, { ...ticket, ...overrides })); return ticketId; }
  async function claim(ticketId, p, overrides = {}) { return sent(vault.connect(relayer).claim(ticketId, ...args(p), { gasLimit: 1800000, ...overrides })); }
  return { rpc, provider, owner, user, relayer, verifier, vault, action, recipientContract, ticket, tx, encode, proof, args, authorize, issue, claim };
}

// A missing failed-receipt requirement would wrongly pay a successful source transaction.
test('eligible verified failure pays only its beneficiary and consumes ticket and source identity', async t => {
  const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p);
  const before = await f.provider.getBalance(f.ticket.beneficiary);
  assert.equal(await f.vault.claimed(ticketId), false);
  const receipt = await f.claim(ticketId, p);
  assert.equal(await f.vault.claimed(ticketId), true);
  assert.equal((await f.provider.getBalance(f.ticket.beneficiary)) - before, rebate);
  assert.equal(await f.vault.totalPaid(), rebate);
  const nullifier = keccak256(coder.encode(['uint64', 'address', 'uint64'], [1, f.ticket.sourceSender, 7]));
  assert.equal(await f.vault.spentTransactions(nullifier), true);
  const event = receipt.logs.map(log => { try { return f.vault.interface.parseLog(log); } catch { return null; } }).find(log => log?.name === 'RebatePaid');
  assert.ok(event); assert.equal(event.args.ticketId, ticketId); assert.equal(event.args.amount, rebate);
});

const policyRejections = [
  ['successful receipt', { status: 1 }],
  ['invalid receipt status', { status: 2 }],
  ['wrong sender', { from: '0x1111111111111111111111111111111111111111' }],
  ['wrong target', { to: '0x1111111111111111111111111111111111111111' }],
  ['contract creation', { toIsNull: true }],
  ['wrong nonce', { nonce: 8n }],
  ['wrong calldata', { data: '0x12345678' }],
  ['nonzero source value', { value: 1n }],
  ['insufficient source gas', { gasLimit: 79999n }],
  ['wrong EVM chain', { chainId: 1n }],
  ['unsupported type', { type: 0 }],
];
for (const [label, change] of policyRejections) {
  test(`rejects proof-authenticated ${label} without consuming ticket`, async t => {
    const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof({ encodedTransaction: f.encode(change) }); await f.authorize(p);
    await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.claimed(ticketId), false); assert.equal(await f.vault.totalPaid(), 0n);
  });
}
for (const [label, override] of [['wrong source chain key', { chainKey: 2n }], ['block before range', { headerNumber: 99n }], ['block after range', { headerNumber: 121n }], ['malformed encoding', { encodedTransaction: '0x1234' }]]) {
  test(`rejects ${label} even when verifier authenticates the tuple`, async t => {
    const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof(override); await f.authorize(p);
    await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.claimed(ticketId), false);
  });
}
for (const boundary of [100n, 120n]) {
  test(`accepts source block range inclusive boundary ${boundary}`, async t => {
    const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof({ headerNumber: boundary }); await f.authorize(p);
    await f.claim(ticketId, p); assert.equal(await f.vault.claimed(ticketId), true);
  });
}
for (const tamper of ['payload', 'merkle', 'continuity', 'header']) {
  test(`rejects tampered ${tamper} bound to a different verified proof`, async t => {
    const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p);
    const changed = { ...p };
    if (tamper === 'payload') changed.encodedTransaction = f.encode({ status: 1 });
    if (tamper === 'merkle') changed.merkleProof = { ...p.merkleProof, root: ZeroHash };
    if (tamper === 'continuity') changed.continuityProof = { ...p.continuityProof, roots: [] };
    if (tamper === 'header') changed.headerNumber = 111n;
    await assert.rejects(f.claim(ticketId, changed)); assert.equal(await f.vault.claimed(ticketId), false);
  });
}
test('propagates verifier rejection and does not consume ticket', async t => {
  const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p); await sent(f.verifier.setRevert(true));
  await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.claimed(ticketId), false);
});
test('rejects unknown tickets', async t => {
  const f = await fixture(t); const p = f.proof(); await f.authorize(p); await assert.rejects(f.claim(id('unknown'), p));
});
test('only sponsor may issue a ticket', async t => {
  const f = await fixture(t); await assert.rejects(sent(f.vault.connect(f.user).issueTicket(id('ticket'), f.ticket, { gasLimit: 500000 })));
});
test('only sponsor may directly fund the budget', async t => {
  const f = await fixture(t); await assert.rejects(sent(f.user.sendTransaction({ to: await f.vault.getAddress(), value: 1n, gasLimit: 100000 })));
});
test('native proof rejection occurs before malformed payload decoding', async t => {
  const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof({ encodedTransaction: '0x1234' });
  await sent(f.verifier.setRevert(true));
  await assert.rejects(f.vault.claim.staticCall(ticketId, ...f.args(p)), /native verifier rejected/);
});
test('ticket fields cannot be overwritten by the sponsor', async t => {
  const f = await fixture(t); const ticketId = await f.issue(); await assert.rejects(f.issue(ticketId, { rebate: rebate * 2n }));
});
for (const [label, change] of [
  ['beneficiary does not equal sender', { beneficiary: '0x1111111111111111111111111111111111111111' }],
  ['zero rebate', { rebate: 0n }], ['inverted source range', { minSourceBlock: 121n }],
  ['past deadline', { claimDeadline: 1n }], ['zero minimum gas', { minGasLimit: 0n }],
  ['zero source target', { sourceTarget: '0x0000000000000000000000000000000000000000' }],
]) {
  test(`rejects ticket with ${label}`, async t => { const f = await fixture(t); await assert.rejects(f.issue(id(label), change)); });
}
test('rejects a claim after Creditcoin deadline', async t => {
  const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p);
  await f.rpc.request({ method: 'evm_increaseTime', params: [3601] }); await f.rpc.request({ method: 'evm_mine', params: [] });
  await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.claimed(ticketId), false);
});
test('rejects duplicate claim of one ticket', async t => {
  const f = await fixture(t); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p); await f.claim(ticketId, p);
  await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.totalPaid(), rebate);
});
test('rejects reuse of the same proved source transaction under another ticket', async t => {
  const f = await fixture(t); const first = await f.issue(); const second = await f.issue(id('ticket-2')); const p = f.proof(); await f.authorize(p); await f.claim(first, p);
  await assert.rejects(f.claim(second, p)); assert.equal(await f.vault.claimed(second), false);
});
test('fund shortage rolls back consumption and allows a funded retry', async t => {
  const f = await fixture(t, { funds: 0n }); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p);
  await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.claimed(ticketId), false); assert.equal(await f.vault.totalPaid(), 0n);
  await sent(f.owner.sendTransaction({ to: await f.vault.getAddress(), value: rebate }));
  await f.claim(ticketId, p); assert.equal(await f.vault.claimed(ticketId), true);
});
test('rejecting beneficiary rolls back consumption and permits later payment', async t => {
  const f = await fixture(t, { recipient: true }); const ticketId = await f.issue(); const p = f.proof(); await f.authorize(p);
  await sent(f.recipientContract.configure(await f.vault.getAddress(), '0x', true));
  await assert.rejects(f.claim(ticketId, p)); assert.equal(await f.vault.claimed(ticketId), false); assert.equal(await f.vault.totalPaid(), 0n);
  await sent(f.recipientContract.configure(await f.vault.getAddress(), '0x', false));
  await f.claim(ticketId, p); assert.equal(await f.recipientContract.received(), rebate);
});
test('payment reentry cannot claim another eligible ticket', async t => {
  const f = await fixture(t, { recipient: true }); const first = await f.issue(); const second = await f.issue(id('ticket-2'), { sourceNonce: 8n });
  const p = f.proof(); const other = f.proof({ encodedTransaction: f.encode({ nonce: 8n }) }); await f.authorize(p); await f.authorize(other);
  const reentry = f.vault.interface.encodeFunctionData('claim', [second, ...f.args(other)]);
  await sent(f.recipientContract.configure(await f.vault.getAddress(), reentry, false));
  await f.claim(first, p); assert.equal(await f.recipientContract.received(), rebate); assert.equal(await f.recipientContract.nestedSucceeded(), false); assert.equal(await f.vault.claimed(second), false);
});
test('demo success emits its intent', async t => {
  const f = await fixture(t); const intent = id('real-source-behavior');
  const success = await sent(f.action.connect(f.user).succeed(intent));
  assert.equal(success.status, 1); assert.equal(success.logs.length, 1);
  const event = f.action.interface.parseLog(success.logs[0]); assert.equal(event.args.intent, intent);
});
test('demo failure mines a failed receipt', async t => {
  const f = await fixture(t); const intent = id('real-source-behavior');
  const tx = await f.action.connect(f.user).fail.send(intent, { gasLimit: 100000 });
  let failure; try { await tx.wait(); } catch (error) { failure = error.receipt; }
  assert.ok(failure); assert.equal(failure.status, 0);
});
