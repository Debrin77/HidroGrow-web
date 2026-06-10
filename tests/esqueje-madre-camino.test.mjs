/**
 * Verificación estática: paridad esqueje_hidro y madre_hidro (perf59).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('esqueje: cadena hcSiguientePasoEsquejeHidro y lifecycle', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const lc = read('js/hc-instalacion-lifecycle.js');
  assert.match(cultivo, /function hcSiguientePasoEsquejeHidro/);
  assert.match(cultivo, /global\.hcSiguientePasoEsquejeHidro/);
  assert.match(cultivo, /enraizadoMontajeCompleto/);
  assert.match(lc, /cam === 'esqueje_hidro'/);
  assert.match(lc, /hcSiguientePasoEsquejeHidro/);
  assert.match(lc, /irEnraizadoHub/);
});

test('madre: cadena hcSiguientePasoMadreHidro y lifecycle', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const lc = read('js/hc-instalacion-lifecycle.js');
  assert.match(cultivo, /function hcSiguientePasoMadreHidro/);
  assert.match(cultivo, /global\.hcSiguientePasoMadreHidro/);
  assert.match(lc, /cam === 'madre_hidro'/);
  assert.match(lc, /hcSiguientePasoMadreHidro/);
});

test('fase camino: gates sala+hidro y SVG domo/DWC', () => {
  const fase = read('js/hc-camino-fase.js');
  const sis = read('js/hc-sistema-fase-camino.js');
  assert.match(fase, /c === 'esqueje_hidro'[\s\S]*checklistInstalacionConfirmada/);
  assert.match(fase, /c === 'madre_hidro'[\s\S]*checklistInstalacionConfirmada/);
  assert.match(fase, /hcSistemaEsquejeMuestraEsquemaDomo/);
  assert.match(fase, /hcSistemaMadreMuestraEsquemaDwc/);
  assert.match(fase, /hcEsquejeEnraizadoHubEsPrincipal/);
  assert.match(sis, /esquemaDomoEsqueje/);
  assert.match(sis, /hcRenderPropagadorSvg/);
  assert.match(sis, /esquemaMadreDwc/);
});

test('inicio: hubs enraizado y madre independientes', () => {
  const html = read('index.html');
  const esq = read('js/hc-esquejes-madre.js');
  assert.match(html, /id="dashEnraizadoHub"/);
  assert.match(html, /id="dashMadreHub"/);
  assert.match(esq, /function refreshDashEnraizadoHub/);
  assert.match(esq, /function refreshDashMadreHub/);
  assert.match(esq, /Protocolo completo → Medir/);
});

test('medir: banner enraizado apunta a Inicio hub', () => {
  const flujo = read('js/hc-camino-flujo-ui.js');
  assert.match(flujo, /irEnraizadoHub/);
  assert.doesNotMatch(flujo, /Inicio\/checklist/);
});

test('enraizado: montaje unificado en esquejesProtocolo.montaje', () => {
  const esq = read('js/hc-esquejes-madre.js');
  const mont = read('js/hc-propagador-montaje.js');
  assert.match(esq, /montaje:\s*\{\}/);
  assert.match(esq, /montajeVerificadoAt/);
  assert.match(esq, /function hcEnraizadoChecksViewFromProtocolo/);
  assert.match(esq, /function hcGuardarEnraizadoChecksEnProtocolo/);
  assert.match(esq, /function hcMigrarEnraizadoMontajeLegacy/);
  assert.match(esq, /MONTAJE_ENRAIZADO_IDS/);
  assert.match(mont, /key === 'enraizadoMontajeChecks'/);
  assert.match(mont, /hcEnraizadoChecksViewFromProtocolo/);
  assert.match(mont, /hcGuardarEnraizadoChecksEnProtocolo/);
  assert.match(mont, /refreshDashEnraizadoHub/);
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /'esquejesProtocolo'/);
});
