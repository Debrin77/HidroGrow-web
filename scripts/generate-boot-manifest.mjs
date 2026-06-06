/**
 * Genera js/hc-boot-manifest.js desde las etiquetas <script> de index.html.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const build = process.argv[2] || '2026-05-31-boot-fast';

const SKIP = new Set([
  'js/hc-bootstrap-config.js',
  'js/hc-bootstrap-state.js',
  'js/hc-bootstrap-pin.js',
  'js/hc-boot-loader.js',
  'js/hc-boot-manifest.js',
  'js/app-hc-pwa-fotodb.js',
  'js/hc-theme.js',
]);

const urls = [];
for (const m of html.matchAll(/<script(?:\s+defer)?\s+src="([^"]+)"/g)) {
  const full = m[1];
  const base = full.split('?')[0].replace(/^\.\//, '');
  if (SKIP.has(base)) continue;
  if (urls.includes(full)) continue;
  urls.push(full.replace(/\?v=[^"']+/, '?v=' + build));
}

const out =
  '/** Auto-generado por scripts/generate-boot-manifest.mjs — no editar a mano */\n' +
  'window.HC_BOOT_LAZY_SCRIPTS = ' +
  JSON.stringify(urls, null, 2) +
  ';\n';

writeFileSync(join(root, 'js', 'hc-boot-manifest.js'), out);
console.log('hc-boot-manifest.js:', urls.length, 'scripts, build', build);
