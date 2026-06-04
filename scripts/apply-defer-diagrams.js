/**
 * Diagramas DWC/RDWC y torre-render: defer para no bloquear arranque/PIN.
 * Orden relativo entre ellos se conserva.
 */
const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '..', 'index.html');
const startMarker = 'hc-diagram-palette.js';
const endMarker = 'torre-render-main.js';
const alsoDefer = ['diagrams/propagador/propagador-diagram.js'];

let html = fs.readFileSync(indexPath, 'utf8');
const i0 = html.indexOf(startMarker);
const i1 = html.indexOf(endMarker, i0);
if (i0 < 0 || i1 < 0) throw new Error('diagram block not found');
const lineStart = html.lastIndexOf('<script', i0);
const lineEnd = html.indexOf('</script>', i1) + '</script>'.length;
const block = html.slice(lineStart, lineEnd);
const lines = block.split(/\r?\n/).filter((l) => l.includes('<script'));
const deferred = lines.map((l) => l.replace('<script src=', '<script defer src='));
let out = html.slice(0, lineStart) + deferred.join('\n') + html.slice(lineEnd);
for (const frag of alsoDefer) {
  const re = new RegExp(
    '\\n<script src="js/([^"]*' + frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"]*)"></script>',
    'i'
  );
  out = out.replace(re, '\n<script defer src="js/$1"></script>');
}
fs.writeFileSync(indexPath, out);
console.log('deferred', deferred.length, 'diagram/torre scripts + propagador');
