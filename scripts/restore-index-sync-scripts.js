const fs = require('fs');
const p = require('path').join(__dirname, '..', 'index.html');
let h = fs.readFileSync(p, 'utf8');
const start = h.indexOf('  <script src="js/hc-ui-icons.js');
const end = h.indexOf('</body>');
if (start < 0) throw new Error('start not found');
const before = h.slice(0, start);
const block = h.slice(start, end);
const lines = block
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.includes('<script'))
  .map((l) => l.replace(/<script defer /g, '<script '));
const sync = lines.filter((l) => !l.includes('hc-boot-ready.js'));
const out = before + sync.join('\n') + '\n' + h.slice(end);
fs.writeFileSync(p, out);
console.log('restored', sync.length, 'sync scripts');
