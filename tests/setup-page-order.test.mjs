/**
 * Orden lógico del asistente por camino (genética antes de equipamiento).
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

test('setup-flow: secuencia premium genética antes de equip', () => {
  const flow = read('js/hc-setup-flow.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(flow, /function getSetupPremiumLogicalSequence/);
  assert.match(flow, /function getSetupOrderedVisiblePages/);
  assert.match(flow, /function getSetupFullPageSequence/);
  assert.match(flow, /return \[O, P1, P2, P5, P6, P4, P3, PEND\]/);
  assert.match(flow, /return getSetupOrderedVisiblePages\(\)/);
  assert.doesNotMatch(
    cultivo,
    /if \(cam === 'semilla_propagador'\) \{[\s\S]{0,200}SETUP_PAGE_PREMIUM_5/
  );
});

test('flujo-ui: banners y labels para los 5 caminos', () => {
  const ui = read('js/hc-camino-flujo-ui.js');
  assert.match(ui, /esqueje_hidro:[\s\S]*6:[\s\S]*Genética/);
  assert.match(ui, /madre_hidro:[\s\S]*4:[\s\S]*Sala/);
  assert.match(ui, /semilla_coco_drip:[\s\S]*4:[\s\S]*tras germinar/);
});

test('reapertura: hcResolverPaginaReaperturaSetup centralizado', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const core = read('js/hc-setup-wizard-core.js');
  assert.match(cultivo, /function hcResolverPaginaReaperturaSetup/);
  assert.match(cultivo, /global\.hcResolverPaginaReaperturaSetup/);
  assert.match(core, /hcResolverPaginaReaperturaSetup/);
  assert.doesNotMatch(
    core,
    /semilla_hidro.*semilla_propagador[\s\S]{0,120}hcSetupFase = 'germinacion'/
  );
});

test('madre: genética P5 y catálogo sin domo', () => {
  const gen = read('js/hc-premium-genetics-germ.js');
  const wiz = read('js/hc-premium-wizard.js');
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(gen, /function validarGeneticaMadreObligatoria/);
  assert.match(wiz, /validarGeneticaMadreObligatoria/);
  assert.match(wiz, /SETUP_PAGE_PREMIUM_5[\s\S]{0,400}validarGeneticaEsquejeObligatoria/);
  assert.match(cat, /function equipCatalogGroupsMadreHidro/);
});

test('coco: nutriente bandeja propagador en germ', () => {
  const nut = read('js/hc-premium-nutriente-germ.js');
  assert.match(nut, /semilla_coco_drip[\s\S]{0,200}hidrogrowPropagadorEnFaseGermSinHidro/);
  assert.match(nut, /semilla_coco_drip[\s\S]{0,80}return true/);
});

test('equip wizard: grupos registrados sin repetir', () => {
  const wiz = read('js/hc-equipamiento-wizard.js');
  assert.match(wiz, /function equipGrupoRegistrado/);
  assert.match(wiz, /equip-catalog-group--registrado/);
  assert.match(wiz, /equip-catalog-group-done/);
});

test('ultimo paso: esqueje y madre usan páginas visibles ordenadas', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /camUlt === 'esqueje_hidro'/);
  assert.match(cultivo, /camUlt === 'madre_hidro'/);
  assert.match(cultivo, /getSetupOrderedVisiblePages/);
});
