/**
 * Carga diferida de JS pesado (calendario, riego, historial, consejos) tras el núcleo de la app.
 */
const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '..', 'index.html');
const deferAfter = 'app-hc-torres-badges-notifs.js';
const deferFiles = [
  'calendario-logic.js',
  'riego-calculo-helpers.js',
  'riego-calculo-calcular.js',
  'hc-setup-historial-tabs.js',
  'hc-historial-seguimiento.js',
  'hc-consejos-extras.js',
  'hc-setup-consejos.js',
  'hc-tools-pro.js',
];

let html = fs.readFileSync(indexPath, 'utf8');
let moved = 0;
const chunks = [];
for (const name of deferFiles) {
  const re = new RegExp(
    '\\n<script src="js/([^"]*' +
      name.replace('.', '\\.') +
      '[^"]*)"></script>',
    'i'
  );
  const m = html.match(re);
  if (!m) {
    console.warn('skip (not found):', name);
    continue;
  }
  html = html.replace(re, '');
  chunks.push(m[1]);
  moved++;
}
if (!moved) {
  console.log('nothing to defer');
  process.exit(0);
}
const insert =
  '\n  <!-- lazy tab chunks (defer, orden conservado) -->\n' +
  chunks.map((src) => '  <script defer src="js/' + src + '"></script>').join('\n') +
  '\n';
const anchor = '<script src="js/' + deferAfter;
const idx = html.indexOf(anchor);
if (idx < 0) throw new Error('anchor not found');
const lineEnd = html.indexOf('</script>', idx) + '</script>'.length;
html = html.slice(0, lineEnd) + insert + html.slice(lineEnd);
fs.writeFileSync(indexPath, html);
console.log('deferred', moved, 'scripts after', deferAfter);
