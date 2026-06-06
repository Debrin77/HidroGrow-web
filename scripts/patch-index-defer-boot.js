const fs = require('fs');
const p = require('path').join(__dirname, '..', 'index.html');
let h = fs.readFileSync(p, 'utf8');
const marker = '<script src="js/hc-ui-icons.js';
const start = h.indexOf(marker);
if (start < 0) throw new Error('marker not found');
const end = h.indexOf('</body>');
const before = h.slice(0, start);
const block = h.slice(start, end);
const lines = block.split(/\r?\n/).filter((l) => l.includes('<script') && !l.includes('hcBootScriptsSelfTest'));
const syncHead = [
  '<script src="js/hc-ui-icons.js?v=2026-05-31-boot3"></script>',
  '<script src="js/hc-icon-registry.js?v=2026-05-31-boot3"></script>',
  '<script src="js/genetics-db.js?v=2026-05-31-boot3"></script>',
  '<script src="js/cultivos-db.js?v=2026-05-31-boot3"></script>',
  '<script src="js/hc-bootstrap-config.js?v=2026-05-31-boot3"></script>',
  '<script src="js/hc-bootstrap-state.js?v=2026-05-31-boot3"></script>',
  '<script src="js/hc-bootstrap-pin.js?v=2026-05-31-boot3"></script>',
  '<script src="js/hc-boot-ready.js?v=2026-05-31-boot3"></script>',
  '<script src="js/app-hc-pwa-fotodb.js?v=2026-05-31-boot3"></script>',
];
const defer = [];
for (const line of lines) {
  let l = line.trim();
  if (!l) continue;
  if (
    /hc-ui-icons|hc-icon-registry|genetics-db|cultivos-db|hc-bootstrap-config|hc-bootstrap-state|hc-bootstrap-pin|hc-boot-ready|app-hc-pwa-fotodb/.test(
      l
    )
  ) {
    continue;
  }
  if (l.includes('hcBootScriptsSelfTest')) continue;
  if (!l.includes('defer ')) l = l.replace('<script ', '<script defer ');
  defer.push(l);
}
const out = before + syncHead.join('\n') + '\n' + defer.join('\n') + '\n' + h.slice(end);
fs.writeFileSync(p, out);
console.log('sync', syncHead.length, 'defer', defer.length);
