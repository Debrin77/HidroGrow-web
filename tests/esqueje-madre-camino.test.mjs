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

test('cestas: sin icono cámara en esquema; tips foto en modal y hub enraizado', () => {
  const scada = read('js/diagrams/dwc/dwc-scada-parts.js');
  const torre = read('js/torre-render-build.js');
  const dwc = read('js/diagrams/dwc/dwc-diagram.js');
  const enr = read('js/hc-esquejes-madre.js');
  const modal = read('js/hc-setup-compat-modal.js');
  assert.doesNotMatch(scada, /hcCestaFotoHintSvg/);
  assert.doesNotMatch(torre, /hcCestaFotoHintSvg/);
  assert.doesNotMatch(dwc, /hcCestaFotoHintSvg/);
  assert.match(enr, /Fotos de seguimiento/);
  assert.match(modal, /modal-fotos-empty-hint/);
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

test('esqueje: textos domo de enraizado, no propagador semilla', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  const wiz = read('js/hc-equipamiento-wizard.js');
  const orig = read('js/hc-premium-origen-paso.js');
  const sis = read('js/hc-sistema-fase-camino.js');
  assert.match(cat, /function equipCategoriaHintContextual/);
  assert.match(cat, /Domo de enraizado para esquejes/);
  assert.match(cat, /EQUIP_ENRAIZADO_GROUP[\s\S]*Domo para enraizar esquejes/);
  assert.match(wiz, /domo de enraizado/);
  assert.match(orig, /Domo de enraizado/);
  assert.doesNotMatch(orig, /esqueje_hidro[\s\S]{0,120}Propagador para enraizar/);
  assert.match(sis, /domo de enraizado/);
  assert.doesNotMatch(sis, /domo y la bandeja/);
});

test('madre: sin checklist propagador ni grupo enraizado', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  const mont = read('js/hc-propagador-montaje.js');
  assert.doesNotMatch(cat, /madre_hidro[\s\S]{0,400}EQUIP_ENRAIZADO_GROUP/);
  assert.match(mont, /esRutaEsqueje\(cfg\)[\s\S]{0,40}ITEMS_ENRAIZADO/);
});
