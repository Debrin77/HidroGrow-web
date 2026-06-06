/**
 * Genera hc-boot-manifest.js: críticos primero, diagramas/lazy al final.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = process.argv[2] || '2026-05-31-boot-ios';

const DEFERRED_RE =
  /diagrams\/|torre-render-|hc-setup-wizard-dwc|hc-setup-rotacion|hc-setup-compat-modal|hc-setup-diario-fotos|hc-setup-historial-delete|hc-setup-registro|hc-param-eval-engine|hc-sala-layout|hc-iot-bridge|hc-mediciones-ambientales|hc-monitor-sistema|hc-setup-mediciones-logic|hc-medir-germinacion|hc-medicion-wizard|hc-setup-checklist|calendario-logic|riego-calculo|hc-setup-historial-tabs|hc-historial-seguimiento|hc-consejos|hc-tools-pro|hc-multi-system-ux|hc-salas-plan|hc-puesta-marcha|hc-diagram-palette|hc-diagram-illo|propagador-diagram/;

const PRIORITY = [
  'state-torre-logic.js',
  'ui-tabs.js',
  'genetics-db.js',
  'cultivos-db.js',
  'meteo-alarm-utils.js',
  'meteo-alarm-parse.js',
  'hc-bootstrap-onboarding.js',
  'hc-bootstrap-init-nav.js',
  'hc-mobile-ui.js',
  'hc-camino-fase.js',
  'hc-medir-operativa.js',
  'hc-instalacion-lifecycle.js',
  'hc-medir-quick-parse.js',
  'hc-dash-recarga.js',
  'hc-medir-sala-layout.js',
  'hc-ui-icons.js',
  'hc-icon-registry.js',
  'backup-capacitor.js',
  'hc-camino-cultivo.js',
  'hc-germinacion-flow.js',
  'hc-sistema-fase-camino.js',
  'hc-camino-flujo-ui.js',
  'hc-propagador-montaje.js',
  'meteo-forecast-meteo.js',
  'meteo-forecast-dashboard.js',
  'meteo-alarm-app.js',
  'app-hc-medicion-toast.js',
  'hc-dash-operativa.js',
  'app-hc-torres-badges-notifs.js',
  'cultivos-germinacion.js',
  'nutrientes-hidrogrow.js',
  'hc-setup-flow.js',
  'hc-setup-wizard-core.js',
  'hc-setup-agua-sustrato.js',
  'hc-torre-resumen-tabla.js',
  'hc-sistema-icons.js',
];

const html = readFileSync(join(root, 'js', 'hc-boot-manifest.js'), 'utf8');
const urls = [...html.matchAll(/"([^"]+\.js[^"]*)"/g)].map((m) => m[1]);

function base(url) {
  return url.split('?')[0].replace(/^\.\//, '').split('/').pop();
}

function withBuild(url) {
  const b = url.split('?')[0];
  if (b.includes('backup-capacitor') || b.includes('state-torre') || b.includes('ui-tabs.js')) {
    return url.includes('?') ? url : url;
  }
  return b + '?v=' + build;
}

const all = urls.map(withBuild);
const deferred = [];
const critical = [];
const seen = new Set();

for (const u of all) {
  const b = base(u);
  if (DEFERRED_RE.test(u) || DEFERRED_RE.test(b)) {
    deferred.push(u);
    seen.add(b);
  }
}

for (const name of PRIORITY) {
  const hit = all.find((u) => base(u) === name);
  if (hit && !seen.has(name)) {
    critical.push(hit);
    seen.add(name);
  }
}

for (const u of all) {
  const b = base(u);
  if (!seen.has(b)) {
    critical.push(u);
    seen.add(b);
  }
}

const out =
  '/** Auto-generado — críticos primero; diagramas tras desbloqueo en móvil */\n' +
  'window.HC_BOOT_CRITICAL_SCRIPTS = ' +
  JSON.stringify(critical, null, 2) +
  ';\n' +
  'window.HC_BOOT_DEFERRED_SCRIPTS = ' +
  JSON.stringify(deferred, null, 2) +
  ';\n' +
  'window.HC_BOOT_LAZY_SCRIPTS = window.HC_BOOT_CRITICAL_SCRIPTS.concat(window.HC_BOOT_DEFERRED_SCRIPTS);\n';

writeFileSync(join(root, 'js', 'hc-boot-manifest.js'), out);
console.log('critical', critical.length, 'deferred', deferred.length, 'build', build);
