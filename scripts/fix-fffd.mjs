import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const indexPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let t = readFileSync(indexPath, 'utf8');

const marker = 'id="spagePremiumOrigen"';
const idx = t.indexOf(marker);
const titleStart = t.indexOf('setup-title">', idx) + 'setup-title">'.length;
const titleEnd = t.indexOf('</div>', titleStart);
const badTitle = t.slice(titleStart, titleEnd);
console.log('bad title codes:', [...badTitle].map((c) => c.codePointAt(0).toString(16)).join(' '));

const before = (t.match(/\uFFFD/g) || []).length;
if (badTitle.includes('\uFFFD')) {
  t = t.slice(0, titleStart) + '¿Cómo empiezas el cultivo?' + t.slice(titleEnd);
}
t = t.replace(/hidrop\uFFFDnico/g, 'hidropónico');
t = t.replace(/RDWC\uFFFD/g, 'RDWC…');
t = t.replace(/seg\uFFFDn/g, 'según');

const after = (t.match(/\uFFFD/g) || []).length;
writeFileSync(indexPath, t, 'utf8');
console.log('U+FFFD before:', before, 'after:', after);
