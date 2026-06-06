/**
 * Restaura index.html: scripts core en sync (como antes del boot defer roto).
 * Solo diagramas y pestañas perezosas quedan en defer.
 */
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'index.html');
let h = fs.readFileSync(p, 'utf8');

const KEEP_DEFER = [
  'hc-diagram-palette.js',
  'diagrams/',
  'torre-render-build.js',
  'torre-render-main.js',
  'propagador-diagram.js',
  'hc-setup-wizard-dwc.js',
  'hc-setup-rotacion.js',
  'hc-setup-compat-modal.js',
  'hc-setup-diario-fotos.js',
  'hc-setup-historial-delete.js',
  'hc-setup-registro.js',
  'hc-param-eval-engine.js',
  'hc-sala-layout.js',
  'hc-iot-bridge.js',
  'hc-mediciones-ambientales.js',
  'hc-monitor-sistema.js',
  'hc-setup-mediciones-logic.js',
  'hc-medir-germinacion.js',
  'hc-medicion-wizard.js',
  'hc-setup-checklist.js',
  'meteo-forecast-dashboard.js',
  'calendario-logic.js',
  'riego-calculo-helpers.js',
  'riego-calculo-calcular.js',
  'hc-setup-historial-tabs.js',
  'hc-historial-seguimiento.js',
  'hc-consejos-extras.js',
  'hc-setup-consejos.js',
  'hc-tools-pro.js',
  'hc-multi-system-ux.js',
  'hc-salas-plan.js',
  'hc-puesta-marcha.js',
];

function shouldDefer(line) {
  return KEEP_DEFER.some((frag) => line.includes(frag));
}

const lines = h.split(/\r?\n/);
const out = lines
  .filter((line) => !line.includes('hc-boot-ready.js'))
  .map((line) => {
    if (!line.includes('<script')) return line;
    if (!line.includes('defer ')) return line;
    if (shouldDefer(line)) return line;
    return line.replace(/<script defer /g, '<script ');
  });

fs.writeFileSync(p, out.join('\n'));
console.log('index restaurado: core sync, defer solo diagramas/lazy');
