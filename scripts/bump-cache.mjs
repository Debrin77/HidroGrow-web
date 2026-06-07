import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = process.argv[2] || '2026-05-31-boot3';
const htmlPath = join(root, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
html = html.replace(/\?v=[^"']+/g, `?v=${build}`);
writeFileSync(htmlPath, html);
const n = (html.match(new RegExp(build, 'g')) || []).length;
console.log(`index.html: ${n} refs -> ${build}`);
