import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = process.argv[2] || '2026-05-31-boot-fast';
const p = join(root, 'index.html');
let h = readFileSync(p, 'utf8');

const marker = '</div>\n\n<!-- ══ APP ══ -->';
const idx = h.indexOf(marker);
if (idx < 0) throw new Error('pin/app marker not found');

const boot = [
  '',
  `<script src="js/hc-bootstrap-config.js?v=${build}"></script>`,
  `<script src="js/hc-bootstrap-state.js?v=${build}"></script>`,
  `<script src="js/hc-bootstrap-pin.js?v=${build}"></script>`,
  `<script src="js/hc-boot-manifest.js?v=${build}"></script>`,
  `<script src="js/hc-boot-loader.js?v=${build}"></script>`,
  `<script src="js/app-hc-pwa-fotodb.js?v=${build}"></script>`,
  '',
].join('\n');

const endScripts = h.indexOf('<script src="js/hc-bootstrap-config.js');
const endBody = h.indexOf('</body>');
if (endScripts >= 0 && endScripts < endBody) {
  h = h.slice(0, endScripts) + h.slice(endBody);
}

if (!h.includes('js/hc-boot-loader.js')) {
  h = h.slice(0, idx) + boot + h.slice(idx);
}
writeFileSync(p, h);
console.log('index.html: boot rápido junto al PIN');
