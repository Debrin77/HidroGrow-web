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
    Title: 'HidroGrow — Diagrama de flujo completo (todos los pasos)',
    Author: 'HidroGrow',
    Subject: 'Flujo de aplicación DWC/RDWC · 4 caminos',
    Keywords: 'HidroGrow, hidroponia, DWC, RDWC, propagador, esqueje, madre, flujo',
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
  doc.text('HidroGrow · Flujo completo · ' + (C.meta.build || ''), { align: 'right' });
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

function h3(text) {
  ensureSpace(22);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND2);
  doc.text(text);
  doc.moveDown(0.2);
}

function p(text, opts) {
  ensureSpace(20);
  doc.font('Helvetica').fontSize(10).fillColor(MUTED);
  doc.text(text, Object.assign({ lineGap: 3 }, opts || {}));
  doc.moveDown(0.3);
}

function bullet(text) {
  ensureSpace(14);
  doc.font('Helvetica').fontSize(9).fillColor(INK);
  doc.text('• ' + text, { indent: 8, lineGap: 1.5 });
}

function bullets(items) {
  items.forEach(bullet);
  doc.moveDown(0.15);
}

/** Lista numerada compacta — todos los pasos */
function numberedSteps(items, startAt) {
  startAt = startAt || 1;
  items.forEach(function (txt, i) {
    ensureSpace(14);
    doc.font('Helvetica').fontSize(8.5).fillColor(INK);
    var num = String(startAt + i).padStart(2, '0');
    doc.text(num + '.  ' + txt, { indent: 4, lineGap: 1.5 });
  });
  doc.moveDown(0.2);
}

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
  h2('6 fases germinación (semilla)');
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

function drawCaminosUiGrid() {
  ensureSpace(140);
  h2('Capas UI por camino (Inicio · Sistema · Medir)');
  C.caminos.forEach(function (c) {
    bullet(c.id + ' · fase ' + c.fase);
    bullet('  Inicio: ' + c.inicio);
    bullet('  Sistema: ' + c.sistema);
    bullet('  Medir: ' + c.medir);
    doc.moveDown(0.1);
  });
}

function drawTabsGrid() {
  ensureSpace(180);
  h2('Barra de pestañas (10)');
  var left = doc.page.margins.left;
  var bw = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  var cols = 2;
  var boxW = (bw - 12) / cols;
  var boxH = 44;
  var y = doc.y + 6;
  C.tabs.forEach(function (t, i) {
    var col = i % cols;
    if (col === 0 && i > 0) y += boxH + 8;
    var x = left + col * (boxW + 12);
    flowBox(x, y, boxW, boxH, t.tab, [t.uso], i % 2 === 0 ? FILL : FILL2, BRAND2);
  });
  doc.y = y + boxH + 16;
}

function sectionSteps(title, intro, steps) {
  doc.addPage();
  pageHeader(false);
  h1(title);
  if (intro) p(intro);
  numberedSteps(steps);
}

function sectionStepsContinued(title, steps, partLabel) {
  doc.addPage();
  pageHeader(false);
  h1(title + (partLabel ? ' (' + partLabel + ')' : ''));
  numberedSteps(steps);
}

// ─── Portada ───
doc.font('Helvetica-Bold').fontSize(26).fillColor(BRAND);
doc.text(C.meta.app, { align: 'center' });
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(14).fillColor(INK);
doc.text('Diagrama de flujo — todos los pasos', { align: 'center' });
doc.moveDown(0.2);
doc.fontSize(11).fillColor(MUTED);
doc.text(C.meta.subtitulo, { align: 'center' });
doc.moveDown(1);

var coverW = doc.page.width - 96;
var coverX = 48;
flowBox(
  coverX,
  doc.y,
  coverW,
  88,
  'Alcance de este documento',
  [
    'Flujo completo: arranque, asistente 15 pasos, 4 caminos independientes.',
    'Checklists itemizados · germinación 6 fases · domo 10 días · operativa.',
    'Solo DWC/RDWC · datos locales: ' + C.meta.storageKey,
    'Versión Mermaid editable: ' + C.meta.mdRef,
  ],
  FILL,
  BRAND
);
doc.y += 100;
doc.moveDown(0.6);
doc.font('Helvetica').fontSize(10).fillColor(MUTED);
doc.text('Documento v' + C.meta.version + ' · ' + C.meta.fecha + ' · build ' + C.meta.build, { align: 'center' });
doc.text('Regenerar: npm run docs:flujo-pdf', { align: 'center' });

// ─── 1. Arranque ───
doc.addPage();
pageHeader(false);
h1('1. Arranque y onboarding');
p('Cada instalación (ranura) es independiente. Varios caminos pueden coexistir sin mezclar progreso.');
h2('Secuencia completa');
numberedSteps(C.arranqueDetallado);
h2('Resumen primera vez');
bullets(C.arranque);

// ─── 2. Asistente ───
doc.addPage();
pageHeader(false);
h1('2. Asistente de configuración (15 pasos)');
p('P6 define caminoCultivo: semilla_propagador | semilla_hidro | esqueje_hidro | madre_hidro');
h2('Bloque premium P0–P7 (detalle)');
numberedSteps(C.premiumDetallado);
h2('Bloque técnico S1–S7 (detalle)');
numberedSteps(C.setupTecnicoDetallado);
p('Propagador: omite geometría DWC en asistente inicial. Semilla hidro: sala + DWC en un solo flujo.');

// ─── 3. Checklists ───
doc.addPage();
pageHeader(false);
h1('3. Checklists físicos — ítems uno a uno');
h3('Propagador (propagadorMontajeChecks) — 7 ítems');
numberedSteps(C.checklistPropagador);
h3('Prep hidro semilla (preparacionGermHidroChecks) — 6 ítems');
numberedSteps(C.checklistPrepHidro);
h3('Enraizado esqueje (esquejesProtocolo.montaje) — 6 ítems');
numberedSteps(C.checklistEnraizado);
p('Montaje sala: puestaMarchaChecks dinámico según equipamiento. Depósito: instalacionPrimerLlenadoAt.');

// ─── 4. Germinación + domo ───
doc.addPage();
pageHeader(false);
h1('4. Germinación y domo día a día');
drawGerminacionRail();
h3('Detalle fases (IDs en código)');
(C.germinacionFases || []).forEach(function (f) {
  bullet('F' + f.n + ' · ' + f.id + ' — ' + f.titulo + ': ' + f.nota);
});
doc.moveDown(0.3);
h2('Domo 10 días post-corte (esquejesProtocolo.domoDias)');
numberedSteps(C.domoDias);

// ─── 5–8. Caminos ───
sectionSteps(
  '5. Camino A — semilla_propagador',
  '28 pasos desde asistente sin sala/DWC hasta operativa hidro completa.',
  C.caminoPropagador
);

sectionSteps(
  '6. Camino B — semilla_hidro',
  'Asistente único con sala + DWC. Germinación en el mismo cubo (hidro_directo).',
  C.caminoSemillaHidro
);

sectionSteps(
  '7. Camino C — esqueje_hidro (instalación → corte)',
  'Montaje unificado en esquejesProtocolo.montaje (modal = Inicio = Medir).',
  C.caminoEsqueje.slice(0, 14)
);

sectionStepsContinued('7. Camino C — esqueje_hidro', C.caminoEsqueje.slice(14), 'domo → operativa');

sectionSteps(
  '8. Camino D — madre_hidro',
  'Cubo 18/6 permanente · sesiones esqueje cada 10–14 d · EC 1000–1400 µS en producción.',
  C.caminoMadre
);

// ─── 9. Operativa + referencia ───
doc.addPage();
pageHeader(false);
h1('9. Operativa, UI y datos');
drawLifecycleDiagram();
drawCaminosUiGrid();
h2('Rutina diaria post-instalación (12 pasos)');
numberedSteps(C.operativaDiaria);
drawTabsGrid();
h2('Claves persistidas por ranura');
bullets(C.dataKeys);

// ─── 10. Diagrama ASCII ───
doc.addPage();
pageHeader(false);
h1('10. Diagrama maestro (referencia rápida)');

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
  '    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐',
  '    │PROPAGADOR│ │SEM HIDRO │ │ ESQUEJE  │ │  MADRE   │',
  '    │ A1–A28   │ │ B1–B25   │ │ E1–E35   │ │ M1–M28   │',
  '    └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘',
  '         └────────────┼────────────┼────────────┘',
  '                      ▼            ▼',
  '              ┌────────────────────────┐',
  '              │ Config→Montaje→Matriz  │',
  '              │ →Depósito→OPERATIVA    │',
  '              └───────────┬────────────┘',
  '                          ▼',
  '              ┌────────────────────────┐',
  '              │ MEDIR · HISTORIAL · CAL│',
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
  'Documento generado desde scripts/app-flow-content.js. ' +
    'Versión completa con Mermaid: ' +
    C.meta.mdRef
);

doc.end();

console.log('PDF generado:', OUT);
