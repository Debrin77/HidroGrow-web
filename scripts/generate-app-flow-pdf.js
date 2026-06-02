/**
 * Genera PDF del diagrama de flujo completo de HidroGrow (DWC/RDWC).
 * Uso: npm run docs:flujo-pdf
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const C = require('./app-flow-content');

const OUT = path.resolve(__dirname, '..', 'docs', 'HidroGrow-diagrama-flujo-completo.pdf');
const BRAND = '#15803d';
const BRAND2 = '#0f766e';
const INK = '#0f172a';
const MUTED = '#475569';
const LINE = '#94a3b8';
const FILL = '#f0fdf4';
const FILL2 = '#ecfdf5';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 48, bottom: 48, left: 48, right: 48 },
  info: {
    Title: 'HidroGrow — Diagrama de flujo completo',
    Author: 'HidroGrow',
    Subject: 'Flujo de aplicación DWC/RDWC',
    Keywords: 'HidroGrow, hidroponia, cannabis, DWC, RDWC, flujo',
  },
});

doc.pipe(fs.createWriteStream(OUT));

function ensureSpace(h) {
  if (doc.y + h > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    pageHeader(false);
  }
}

function pageHeader(first) {
  if (!first) doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND2);
  doc.text('HidroGrow · Diagrama de flujo · DWC/RDWC', { align: 'right' });
  doc.moveDown(0.4);
  doc.strokeColor(LINE).lineWidth(0.5);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.5);
}

function h1(text) {
  ensureSpace(36);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(BRAND);
  doc.text(text, { align: 'left' });
  doc.moveDown(0.35);
}

function h2(text) {
  ensureSpace(28);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(INK);
  doc.text(text);
  doc.moveDown(0.25);
}

function p(text, opts) {
  ensureSpace(20);
  doc.font('Helvetica').fontSize(10).fillColor(MUTED);
  doc.text(text, Object.assign({ lineGap: 3 }, opts || {}));
  doc.moveDown(0.3);
}

function bullet(text) {
  ensureSpace(16);
  doc.font('Helvetica').fontSize(9.5).fillColor(INK);
  doc.text('• ' + text, { indent: 8, lineGap: 2 });
}

function bullets(items) {
  items.forEach(bullet);
  doc.moveDown(0.2);
}

/** Caja de flujo con título y líneas */
function flowBox(x, y, w, h, title, lines, fill, stroke) {
  fill = fill || FILL;
  stroke = stroke || BRAND;
  doc.save();
  doc.roundedRect(x, y, w, h, 5).fillAndStroke(fill, stroke);
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(9);
  doc.text(title, x + 8, y + 7, { width: w - 16 });
  var ty = y + 22;
  doc.fillColor(INK).font('Helvetica').fontSize(8);
  (lines || []).forEach(function (ln) {
    doc.text(ln, x + 8, ty, { width: w - 16, lineGap: 1 });
    ty += doc.heightOfString(ln, { width: w - 16 }) + 2;
  });
  doc.restore();
}

function arrowDown(cx, y1, y2) {
  doc.save();
  doc.strokeColor(BRAND2).lineWidth(1.2);
  doc.moveTo(cx, y1).lineTo(cx, y2 - 6).stroke();
  doc.moveTo(cx - 4, y2 - 10).lineTo(cx, y2 - 4).lineTo(cx + 4, y2 - 10).stroke();
  doc.restore();
}

function arrowRight(x1, y, x2) {
  doc.save();
  doc.strokeColor(BRAND2).lineWidth(1.2);
  doc.moveTo(x1, y).lineTo(x2 - 6, y).stroke();
  doc.moveTo(x2 - 10, y - 4).lineTo(x2 - 4, y).lineTo(x2 - 10, y + 4).stroke();
  doc.restore();
}

function drawLifecycleDiagram() {
  ensureSpace(200);
  h2('Ciclo de instalación (hub Inicio)');
  var left = doc.page.margins.left;
  var bw = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  var boxW = (bw - 24) / 2;
  var boxH = 52;
  var y0 = doc.y + 8;
  var cx = left + bw / 2;

  var steps = C.lifecycle;
  for (var i = 0; i < 4; i++) {
    var col = i % 2;
    var row = Math.floor(i / 2);
    var x = left + col * (boxW + 24);
    var y = y0 + row * (boxH + 28);
    var s = steps[i];
    flowBox(x, y, boxW, boxH, s.label, [s.desc], i % 2 ? FILL2 : FILL, BRAND);
    if (i < 3) {
      if (i === 0) arrowRight(x + boxW, y + boxH / 2, x + boxW + 24);
      if (i === 1) arrowDown(cx, y + boxH, y + boxH + 22);
      if (i === 2) arrowRight(x + boxW, y + boxH / 2, x + boxW + 24);
    }
  }
  var op = steps[4];
  var yOp = y0 + 2 * (boxH + 28) + 8;
  flowBox(left, yOp, bw, 44, op.label, [op.desc], '#dcfce7', '#16a34a');
  doc.y = yOp + 52;
  doc.moveDown(0.5);
}

function drawGerminacionRail() {
  ensureSpace(120);
  h2('Rama semilla — Germinación (Inicio)');
  p('Paralelo al lifecycle hasta traslado al cubo. Equipamiento del propagador en el hub.');
  var left = doc.page.margins.left;
  var bw = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  var n = C.germinacion.length;
  var gap = 6;
  var boxW = (bw - gap * (n - 1)) / n;
  var y = doc.y + 6;
  var minH = 58;
  C.germinacion.forEach(function (txt, i) {
    var x = left + i * (boxW + gap);
    var short = txt.replace(/^F\d+ · /, '');
    flowBox(x, y, boxW, minH, 'F' + (i + 1), [short], i === n - 1 ? '#dbeafe' : FILL, i === n - 1 ? '#2563eb' : BRAND2);
    if (i < n - 1) arrowRight(x + boxW, y + minH / 2, x + boxW + gap);
  });
  doc.y = y + minH + 12;
}

function drawTabsGrid() {
  ensureSpace(180);
  h2('Navegación — barra de pestañas');
  var left = doc.page.margins.left;
  var bw = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  var cols = 2;
  var boxW = (bw - 12) / cols;
  var boxH = 44;
  var y = doc.y + 6;
  C.tabs.forEach(function (t, i) {
    var col = i % cols;
    var row = Math.floor(i / cols);
    if (col === 0 && i > 0) y += boxH + 8;
    var x = left + col * (boxW + 12);
    flowBox(x, y, boxW, boxH, t.tab, [t.uso], i % 2 === 0 ? FILL : FILL2, BRAND2);
  });
  doc.y = y + boxH + 16;
}

// ─── Portada ───
doc.font('Helvetica-Bold').fontSize(26).fillColor(BRAND);
doc.text(C.meta.app, { align: 'center' });
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(14).fillColor(INK);
doc.text('Diagrama de flujo completo de la aplicación', { align: 'center' });
doc.moveDown(0.2);
doc.fontSize(11).fillColor(MUTED);
doc.text(C.meta.subtitulo, { align: 'center' });
doc.moveDown(1.2);

var coverW = doc.page.width - 96;
var coverX = 48;
flowBox(
  coverX,
  doc.y,
  coverW,
  72,
  'Alcance de este documento',
  [
    'Flujo desde primera apertura hasta cultivo operativo diario.',
    'Solo sistemas DWC y RDWC (sin torre/NFT/SRF).',
    'Datos locales: ' + C.meta.storageKey + ' · PWA / Capacitor.',
  ],
  FILL,
  BRAND
);
doc.y += 88;
doc.moveDown(0.8);
doc.font('Helvetica').fontSize(10).fillColor(MUTED);
doc.text('Versión documento: ' + C.meta.version + ' · ' + C.meta.fecha, { align: 'center' });
doc.text('Generar de nuevo: npm run docs:flujo-pdf', { align: 'center' });

// ─── Página 2: macro ───
doc.addPage();
pageHeader(false);
h1('1. Vista general');
p(
  'El usuario entra por la bienvenida, configura la instalación en el asistente (premium + técnico), ' +
    'completa montaje y cultivo, y pasa a la rutina en Medir. Si el origen es semilla, el hub de Germinación en Inicio corre en paralelo hasta el traslado al cubo.'
);

var mx = doc.page.margins.left;
var mw = doc.page.width - mx - doc.page.margins.right;
var my = doc.y + 10;
var mh = 40;
var seq = [
  ['Bienvenida', 'Coach tabs'],
  ['Asistente', 'Guardar config'],
  ['Lifecycle', '4 pasos'],
  ['Operativa', 'Medir diario'],
];
var sw = (mw - 36) / 4;
seq.forEach(function (pair, i) {
  var x = mx + i * (sw + 12);
  flowBox(x, my, sw, mh, pair[0], [pair[1]], FILL, BRAND);
  if (i < 3) arrowRight(x + sw, my + mh / 2, x + sw + 12);
});
doc.y = my + mh + 20;

h2('Arranque (primera vez)');
bullets(C.arranque);

// ─── Página 3: asistente ───
doc.addPage();
pageHeader(false);
h1('2. Asistente de configuración');

h2('Bloque premium (7 pasos)');
bullets(C.premium);

h2('Bloque técnico hidro (7 pasos)');
bullets(C.setupTecnico);

p('Tras guardar: checklist post-setup opcional · barra de progreso en Inicio hasta modo operativo.');

// ─── Página 4: lifecycle + germinación ───
doc.addPage();
pageHeader(false);
h1('3. Instalación y origen de planta');
drawLifecycleDiagram();

h2('Origen de planta — ramas');
C.origenRamas.forEach(function (r) {
  bullet(r.origen + ': ' + r.flujo);
});
doc.moveDown(0.3);
drawGerminacionRail();

// ─── Página 5: pestañas y rutina ───
doc.addPage();
pageHeader(false);
h1('4. Uso diario de la app');
drawTabsGrid();

h2('Rutina diaria (modo operativo)');
bullets(C.rutinaDiaria);

h2('Utilidades transversales');
bullets([
  'Exportar / importar estado (backup JSON)',
  'Varias instalaciones — selector en Inicio',
  'Herramientas PRO (Medir): EC, pH, LED plántulas',
  'Perfil tienda de semillas (opcional) — no confundir con propagador',
  'IoT opcional: gateway WiFi autocompleta Medir',
  'Historial: gráficos y banda teórica EC/pH por fase',
]);

// ─── Página 6: diagrama maestro texto ───
doc.addPage();
pageHeader(false);
h1('5. Diagrama maestro (referencia rápida)');

var diagramLines = [
  '                    ┌─────────────┐',
  '                    │  BIENVENIDA │',
  '                    └──────┬──────┘',
  '                           ▼',
  '                    ┌─────────────┐',
  '                    │ COACH TABS  │',
  '                    └──────┬──────┘',
  '                           ▼',
  '         ┌────────────────────────────────────┐',
  '         │     ASISTENTE (P0–P7 + S1–S7)      │',
  '         └────────────────┬───────────────────┘',
  '                          ▼',
  '    ┌──────────┐   ┌──────────────┐   ┌─────────────┐',
  '    │ SEMILLA  │   │ CLON/ESQUEJE │   │    MADRE    │',
  '    │ 6 fases  │   │  checklist   │   │  18/6 · cal │',
  '    │ Inicio   │   │  domo → cubo │   │  esquejes   │',
  '    └────┬─────┘   └──────┬───────┘   └──────┬──────┘',
  '         └────────────────┼──────────────────┘',
  '                          ▼',
  '              ┌────────────────────────┐',
  '              │ 1 Config → 2 Montaje   │',
  '              │ → 3 Cultivo → 4 Llenado│',
  '              └───────────┬────────────┘',
  '                          ▼',
  '              ┌────────────────────────┐',
  '              │   OPERATIVA · MEDIR    │',
  '              │ Historial · Calendario │',
  '              └────────────────────────┘',
];

doc.font('Courier').fontSize(7.5).fillColor(INK);
diagramLines.forEach(function (ln) {
  ensureSpace(12);
  doc.text(ln, { lineGap: 0 });
});
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(9).fillColor(MUTED);
p(
  'Documento generado automáticamente desde el código de HidroGrow-web. ' +
    'Para la versión editable en Mermaid: docs/diagrama-flujo-hidrogrow.md'
);

doc.end();

console.log('PDF generado:', OUT);
