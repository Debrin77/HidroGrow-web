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

test('coco drip: módulos medir/dash con visibilidad condicionada', () => {
  const html = read('index.html');
  assert.match(html, /medirCocoDripCard/);
  assert.match(html, /dashCocoDripRiego/);
  const coco = read('js/hc-camino-coco-drip.js');
  assert.match(coco, /hcCocoDripMedirRunoffVisible/);
  assert.match(coco, /hcCocoDripDashGoteoVisible/);
  assert.match(read('js/hc-medir-coco-drip.js'), /hcCocoDripMedirRunoffVisible/);
});

test('coco drip post-germ: setup hidro abre geometría DTW', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /camH === 'semilla_coco_drip'[\s\S]*SETUP_PAGE_GEOMETRY/);
  assert.match(cultivo, /function getSetupSkippedPagesForHidroFase/);
  assert.match(cultivo, /skip\.add\(end\)/);
});

test('propagador: medidor en germ y catálogo Sala sin hidro', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(cat, /keys: \['propagador', 'higrometro_germ', 'mat_termica_germ', 'medidor'\]/);
  assert.match(cat, /semilla_propagador[\s\S]*hcPropagadorEquipSalaSinHidro/);
  assert.match(cat, /function equipCatalogGroupsCocoDrip/);
  assert.match(cat, /keys: \['propagador', 'higrometro_germ', 'mat_termica_germ'\]/);
  assert.match(cat, /programador_riego/);
  assert.match(cat, /Reservorio \+ goteo DTW/);
  assert.doesNotMatch(cat, /Prep coco \+ reservorio/);
  assert.match(cat, /germinacionConcluida/);
  assert.match(cat, /equipFilterKeysAlreadyListed/);
});

test('coco drip setup: omite paso DWC/RDWC y valida coco_drip', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /cam === 'semilla_coco_drip'[\s\S]*SETUP_PAGE_PREMIUM_END/);
  const premium = read('js/hc-premium-wizard.js');
  assert.match(premium, /camEnd === 'semilla_coco_drip'/);
  assert.match(premium, /setupTipoInstalacion !== 'coco_drip'/);
});

test('inicio: banner sala opcional tras montaje (comportamiento previo)', () => {
  const sync = read('js/hc-luz-equip-sync.js');
  assert.match(sync, /paso === 'done' && getEquipamientoSalaOpcionalPendiente\(cfg\)\.length > 0/);
});

test('index: build perf87 y cinco caminos', () => {
  const html = read('index.html');
  assert.match(html, /perf87/);
  assert.match(html, /cinco caminos/);
});

test('coco drip: copy bomba goteo y programador en asistente', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  const wizard = read('js/hc-equipamiento-wizard.js');
  const flujo = read('js/hc-camino-flujo-ui.js');
  assert.match(cat, /Bomba de goteo \(reservorio\)/);
  assert.match(cat, /Programador de riego \(impulsos\)/);
  assert.match(wizard, /semilla_coco_drip/);
  assert.match(wizard, /programador de impulsos/);
  assert.match(flujo, /Sala y propagador/);
  assert.match(read('index.html'), /Bomba de goteo en reservorio/);
});

test('coco drip: equipamiento P3 no bloquea por catálogo completo en fase germ', () => {
  const wiz = read('js/hc-premium-wizard.js');
  const pages = read('js/hc-setup-wizard-pages.js');
  assert.match(
    wiz,
    /semilla_coco_drip[\s\S]{0,200}hcAsegurarMedidasSalaInteriorAntesGuardar/
  );
  assert.match(wiz, /hcCaminoSemillaGermEnSetup[\s\S]{0,400}return true/);
  assert.match(wiz, /restorePremiumMetodoGenBundleToPage5/);
  assert.match(pages, /function hcSetupRetrocederPaginaVisible/);
});

test('coco drip: integración sala m² → plantas y VPD', () => {
  const mod = read('js/hc-camino-coco-drip.js');
  assert.match(mod, /resolveCocoDripSalaAreaM2/);
  assert.match(mod, /sugerirCocoDripPlantasDesdeSala/);
  assert.match(mod, /calcularCocoDripGridDesdePlantas/);
  assert.match(mod, /resolverCocoDripNumPlantasEfectivo/);
  assert.match(mod, /resolveCocoDripVpdKpa/);
  assert.match(mod, /hcAplicarCocoDripGeometriaDesdeSala/);
  assert.match(read('js/hc-camino-cultivo.js'), /hcAplicarCocoDripGeometriaDesdeSala/);
  assert.match(read('js/hc-setup-calc-core.js'), /calcularCocoDripGridDesdePlantas/);
  assert.match(read('js/hc-coco-drip-scheduler.js'), /resolveCocoDripVpdKpa/);
});
