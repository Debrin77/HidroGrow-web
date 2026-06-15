/**
 * Camino semilla_coco_drip y fixes propagador en catálogo Sala.
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

test('camino: semilla_coco_drip en CAMINOS y orden de tarjetas', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /semilla_coco_drip:\s*\{/);
  assert.match(cultivo, /CAMINO_CARD_ORDER[\s\S]*'semilla_coco_drip'/);
  assert.match(cultivo, /cinco caminos/);
  assert.match(cultivo, /global\.hcCaminoSemillaCocoDripSetupGerm/);
});

test('coco drip: módulo EC/pH, sala y boot', () => {
  const mod = read('js/hc-camino-coco-drip.js');
  assert.match(mod, /COCO_DRIP_EC_US/);
  assert.match(mod, /hcCocoDripEquipSalaSinFertigacion/);
  assert.match(mod, /runoff/i);
  assert.match(read('js/hc-boot-manifest.js'), /hc-camino-coco-drip\.js/);
});

test('coco drip: diagrama SVG cenital + corte', () => {
  const diag = read('js/diagrams/coco-drip/coco-drip-diagram.js');
  assert.match(diag, /buildCocoDripDiagramSvg/);
  assert.match(diag, /generarSVGCocoDrip/);
  assert.match(diag, /coco-drip-bag/);
  assert.match(diag, /renderCrossSection/);
  assert.match(read('js/torre-render-main.js'), /generarSVGCocoDrip/);
  assert.match(read('js/hc-boot-manifest.js'), /coco-drip-diagram\.js/);
});

test('coco drip: programación HFF y horarios', () => {
  const mod = read('js/hc-camino-coco-drip.js');
  assert.match(mod, /buildCocoDripProgramacion/);
  assert.match(mod, /COCO_DRIP_EVENTS_BY_FASE/);
  assert.match(mod, /renderCocoDripProgramacionHtml/);
  assert.match(read('index.html'), /setupCocoDripScheduleBlock/);
});

test('coco drip: scheduler tiempo real por genética', () => {
  const sched = read('js/hc-coco-drip-scheduler.js');
  assert.match(sched, /buildCocoDripProgramacionTiempoReal/);
  assert.match(sched, /buildCocoDripProgramacionCelda/);
  assert.match(sched, /enumerateCocoDripCeldas/);
  assert.match(sched, /ajustePorRunoffCocoDrip/);
});

test('coco drip: medir runoff UI y dash', () => {
  const html = read('index.html');
  assert.match(html, /medirCocoDripCard/);
  assert.match(html, /inputCocoDripEcRunoff/);
  assert.match(html, /dashCocoDripRiego/);
  assert.match(read('js/hc-medir-coco-drip.js'), /refreshMedirCocoDripUi/);
});

test('propagador: medidor en germ y catálogo Sala sin hidro', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(cat, /keys: \['propagador', 'higrometro_germ', 'mat_termica_germ', 'medidor'\]/);
  assert.match(cat, /semilla_propagador[\s\S]*hcPropagadorEquipSalaSinHidro/);
  assert.match(cat, /function equipCatalogGroupsCocoDrip/);
});

test('inicio: montaje ok no reabre banner propagador', () => {
  const sync = read('js/hc-luz-equip-sync.js');
  assert.match(sync, /montajeSalaPreGermOk[\s\S]*return 'done'/);
  assert.doesNotMatch(
    sync,
    /paso === 'done' && getEquipamientoSalaOpcionalPendiente/
  );
});

test('dash contextual: oculto en foco germinación', () => {
  const dash = read('js/hc-dash-contextual.js');
  assert.match(dash, /hcDashInicioGermFoco/);
  assert.match(dash, /hcMedirGermPreTrasladoActivo/);
});

test('index: panel interior grow restaurado y build perf86', () => {
  const html = read('index.html');
  assert.match(html, /id="panelConfigInteriorGrow"/);
  assert.match(html, /id="interiorTempC"/);
  assert.match(html, /perf87/);
  assert.match(html, /cinco caminos/);
});
