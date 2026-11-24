/* vendor.mjs: builds the converter's third-party libraries into browser ES modules in tools/converter/vendor/.
   Pinned npm versions (package-lock), shared code split into chunks so a page loads only what its conversion needs.
   Output is committed; run again after updating a library: node scripts/vendor.mjs */
import { build } from 'esbuild';
import { rmSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync } from 'node:fs';
const OUT = 'tools/converter/vendor';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
await build({
  entryPoints: { media: 'scripts/vendor-entries/media.mjs', mp3: 'scripts/vendor-entries/mp3.mjs', gif: 'scripts/vendor-entries/gif.mjs', heic: 'scripts/vendor-entries/heic.mjs' },
  outdir: OUT, bundle: true, splitting: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, legalComments: 'none',
  chunkNames: 'chunk-[hash]', external: ['worker_threads', 'fs', 'path', 'crypto'], logLevel: 'warning'
});
const PKGS = [['mediabunny', 'MPL-2.0'], ['@mediabunny/mp3-encoder', 'MPL-2.0'], ['gifenc', 'MIT'], ['gifuct-js', 'MIT'], ['libheif-js', 'LGPL-3.0']];
const lines = PKGS.map(([p, l]) => {
  const dir = 'node_modules/' + p, v = JSON.parse(readFileSync(dir + '/package.json', 'utf8')).version;
  for (const f of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) if (existsSync(dir + '/' + f)) { copyFileSync(dir + '/' + f, `${OUT}/LICENSE-${p.replace('@', '').replace('/', '-')}.txt`); break; }
  return `- ${p} ${v} (${l})`;
});
writeFileSync(`${OUT}/README.md`, `# Vendored converter libraries\n\nBuilt by \`node scripts/vendor.mjs\` from the pinned npm packages, unmodified apart from bundling and minifying:\n\n${lines.join('\n')}\n\nlibheif-js (LGPL-3.0) is a separate file (heic.mjs, loaded only for HEIC images) so it can be replaced; its source is at https://github.com/catdad-experiments/libheif-js.\n`);
console.log('vendor:', lines.join(', '));
