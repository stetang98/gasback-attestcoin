const fs = require('node:fs');
const path = require('node:path');
let ethers;
try { ethers = require('ethers'); } catch { ethers = require('../chain/node_modules/ethers'); }
const ROOT = path.resolve(__dirname, '..');
const EVIDENCE = path.join(__dirname, 'evidence');
const RPC = {
  source: 'https://ethereum-sepolia-rpc.publicnode.com',
  target: 'https://rpc.cc3-testnet.creditcoin.network',
  prover: 'https://prover.cc3-testnet.creditcoin.network'
};
const CHAIN = { source: 11155111, target: 102031 };
const SECRET_PATH = process.env.GASBACK_TEST_WALLET_FILE || path.join(process.env.USERPROFILE || process.env.HOME || '', '.codex', 'tmp', 'gasback-testnet-secrets', 'wallet.json');
function write(name, value) {
  fs.mkdirSync(EVIDENCE, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE, name), JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
}
function read(name) {
  const p = path.join(EVIDENCE, name);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')) : null;
}
function artifact(name) { return JSON.parse(fs.readFileSync(path.join(ROOT, 'chain', 'artifacts', `${name}.json`), 'utf8')); }
async function provider(which) {
  const p = new ethers.JsonRpcProvider(RPC[which]);
  if (Number((await p.getNetwork()).chainId) !== CHAIN[which]) throw new Error('Unexpected network: testnet-only guard');
  return p;
}
function signer(p) {
  const data = JSON.parse(fs.readFileSync(SECRET_PATH, 'utf8').replace(/^\uFEFF/, ''));
  const wallet = new ethers.Wallet(data.privateKey, p);
  if (wallet.address !== ethers.getAddress(data.address)) throw new Error('Test wallet address mismatch');
  return wallet;
}
async function waitEvenIfReverted(tx) {
  try { return await tx.wait(); }
  catch (error) { if (error.receipt) return error.receipt; throw new Error(error.shortMessage || 'Transaction wait failed'); }
}
function receipt(r) {
  return { transactionHash: r.hash, blockNumber: r.blockNumber, blockHash: r.blockHash,
    status: r.status, from: r.from, to: r.to, contractAddress: r.contractAddress,
    gasUsed: r.gasUsed.toString(), gasPrice: r.gasPrice.toString(),
    logs: r.logs.map(l => ({ address: l.address, topics: [...l.topics], data: l.data, index: l.index })) };
}
function reportError(error) { console.error(error.shortMessage || error.message || 'Operation failed'); process.exitCode = 1; }
module.exports = { fs, path, ethers, ROOT, EVIDENCE, RPC, CHAIN, write, read, artifact, provider, signer, waitEvenIfReverted, receipt, reportError };
