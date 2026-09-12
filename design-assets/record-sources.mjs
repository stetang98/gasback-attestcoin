import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
const revision = '3a1c7f2f9f94ed833934ab5c2635760b9e644583';
const raw = `https://raw.githubusercontent.com/DavidHDev/react-bits/${revision}/`;
const sources = [
  ['react-bits-darkveil/DarkVeil.jsx', raw + 'src/content/Backgrounds/DarkVeil/DarkVeil.jsx'],
  ['react-bits-darkveil/DarkVeil.css', raw + 'src/content/Backgrounds/DarkVeil/DarkVeil.css'],
  ['react-bits-darkveil/DarkVeilDemo.jsx', raw + 'src/demo/Backgrounds/DarkVeilDemo.jsx'],
  ['react-bits-darkveil/darkVeilCode.js', raw + 'src/constants/code/Backgrounds/darkVeilCode.js'],
  ['react-bits-darkveil/LICENSE.md', raw + 'LICENSE.md'],
  ['react-bits-darkveil/vertex.glsl', 'extracted unchanged from DarkVeil.jsx'],
  ['react-bits-darkveil/fragment.glsl', 'extracted unchanged from DarkVeil.jsx'],
  ['ogl/package.json', 'official npm package ogl@1.0.11'],
  ['ogl/README.md', 'official npm package ogl@1.0.11'],
  ['ogl/LICENSE.txt', 'full Unlicense section extracted from official OGL README'],
  ['inter/official-inter.css', 'https://rsms.me/inter/inter.css'],
  ['inter/InterVariable.woff2', 'https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1'],
  ['inter/InterVariable-Italic.woff2', 'https://rsms.me/inter/font-files/InterVariable-Italic.woff2?v=4.1'],
  ['inter/LICENSE.txt', 'https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt'],
];
const manifest = {
  preparedFor: 'GasBack application background integration', retrievedAt: new Date().toISOString(),
  reactBitsRevision: revision, templateParameters: 'Unknown; green preset is locally selected',
  files: sources.map(([file, source]) => {
    const local = new URL(file, import.meta.url);
    return { file, source, bytes: statSync(local).size, sha256: createHash('sha256').update(readFileSync(local)).digest('hex') };
  }),
};
writeFileSync(new URL('sources.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Recorded ${manifest.files.length} source files.`);
