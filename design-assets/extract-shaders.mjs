import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const jsx = readFileSync(path.join(root, 'react-bits-darkveil/DarkVeil.jsx'), 'utf8');
const header = '/* DarkVeil shader source by David Haz, React Bits.\n * MIT + Commons Clause; see react-bits-darkveil/LICENSE.md.\n * Extracted unchanged from commit 3a1c7f2f9f94ed833934ab5c2635760b9e644583.\n */\n';
let module = header;
for (const kind of ['vertex', 'fragment']) {
  const match = jsx.match(new RegExp('const ' + kind + ' = `([\\s\\S]*?)`;'));
  if (!match) throw new Error(`Missing ${kind} shader in downloaded official source`);
  writeFileSync(path.join(root, `react-bits-darkveil/${kind}.glsl`), match[1]);
  module += `export const ${kind} = ${JSON.stringify(match[1])};\n`;
}
writeFileSync(path.join(root, 'darkveil-shaders.js'), module);
mkdirSync(path.join(root, 'ogl'), { recursive: true });
copyFileSync(path.join(root, 'node_modules/ogl/package.json'), path.join(root, 'ogl/package.json'));
copyFileSync(path.join(root, 'node_modules/ogl/README.md'), path.join(root, 'ogl/README.md'));
const oglReadme = readFileSync(path.join(root, 'ogl/README.md'), 'utf8');
writeFileSync(path.join(root, 'ogl/LICENSE.txt'), oglReadme.slice(oglReadme.indexOf('## Unlicense') + '## Unlicense'.length).trim() + '\n');
console.log('Extracted unchanged vertex/fragment GLSL and copied OGL license provenance.');
