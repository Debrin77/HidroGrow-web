import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const t = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
const marker = 'id="spagePremiumOrigen"';
const idx = t.indexOf(marker);
const titleStart = t.indexOf('setup-title">', idx) + 'setup-title">'.length;
const titleEnd = t.indexOf('</div>', titleStart);
const title = t.slice(titleStart, titleEnd);
console.log('title:', title);
for (let j = 0; j < title.length; j++) {
  const c = title[j];
  console.log(j, JSON.stringify(c), 'U+' + c.codePointAt(0).toString(16).toUpperCase());
}
