import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = process.argv[2];
if (!build) {
  console.error('Uso: node scripts/bump-cache.mjs 2026-06-01-perf73');
  process.exit(1);
}

const htmlPath = join(root, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
html = html.replace(/\?v=[^"']+/g, `?v=${build}`);
writeFileSync(htmlPath, html);

const configPath = join(root, 'js/hc-bootstrap-config.js');
let config = readFileSync(configPath, 'utf8');
config = config.replace(/const APP_BUILD_VERSION = '[^']+';/, `const APP_BUILD_VERSION = '${build}';`);
writeFileSync(configPath, config);

const swPath = join(root, 'service-worker.js');
let sw = readFileSync(swPath, 'utf8');
const swCache = `hidrogrow-shell-v${build.replace(/[^a-z0-9]+/gi, '-')}`;
sw = sw.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = '${swCache}';`);
writeFileSync(swPath, sw);

const pwaPath = join(root, 'js/app-hc-pwa-fotodb.js');
let pwa = readFileSync(pwaPath, 'utf8');
pwa = pwa.replace(/service-worker\.js\?v=[^'"]+/, `service-worker.js?v=${build}`);
writeFileSync(pwaPath, pwa);

const n = (html.match(new RegExp(build.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`bump -> ${build}`);
console.log(`  index.html: ${n} refs`);
console.log(`  hc-bootstrap-config.js APP_BUILD_VERSION`);
console.log(`  service-worker.js CACHE_NAME=${swCache}`);
console.log(`  app-hc-pwa-fotodb.js SW register`);
