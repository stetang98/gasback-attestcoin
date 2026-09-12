const fs = require('node:fs');
const path = require('node:path');
const solc = require('solc');

const root = path.resolve(__dirname, '..');
function compile({ includeTests = false, write = false } = {}) {
  const sources = {};
  for (const name of ['GasBackVault', 'DemoAction']) {
    const file = `contracts/${name}.sol`;
    sources[file] = { content: fs.readFileSync(path.join(root, file), 'utf8') };
  }
  if (includeTests) sources['test/helpers/TestContracts.sol'] = {
    content: fs.readFileSync(path.join(root, 'test/helpers/TestContracts.sol'), 'utf8'),
  };
  const settings = {
    optimizer: { enabled: true, runs: 200 },
    viaIR: true,
    evmVersion: 'paris',
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object', 'metadata'] } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify({ language: 'Solidity', sources, settings }), {
    import: file => {
      try { return { contents: fs.readFileSync(path.join(root, 'node_modules', file), 'utf8') }; }
      catch { return { error: `Cannot resolve dependency ${file}` }; }
    },
  }));
  const errors = (output.errors || []).filter(item => item.severity === 'error');
  if (errors.length) throw new Error(errors.map(item => item.formattedMessage).join('\n'));
  const artifacts = {};
  for (const [sourceName, contracts] of Object.entries(output.contracts)) {
    for (const [contractName, compiled] of Object.entries(contracts)) {
      artifacts[contractName] = {
        contractName, sourceName, compiler: solc.version(), evmVersion: settings.evmVersion,
        abi: compiled.abi, bytecode: `0x${compiled.evm.bytecode.object}`,
        deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`,
        metadata: JSON.parse(compiled.metadata),
      };
    }
  }
  if (write) {
    fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    for (const name of ['GasBackVault', 'DemoAction']) {
      fs.writeFileSync(path.join(root, 'artifacts', `${name}.json`), JSON.stringify(artifacts[name], null, 2) + '\n');
      console.log(`${name}: ${(artifacts[name].deployedBytecode.length - 2) / 2} deployed bytes`);
    }
  }
  return artifacts;
}
if (require.main === module) compile({ write: true });
module.exports = { compile };
