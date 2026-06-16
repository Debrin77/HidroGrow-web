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

test('equip wizard: grupos registrados sin repetir', () => {
  const wiz = read('js/hc-equipamiento-wizard.js');
  assert.match(wiz, /function equipGrupoRegistrado/);
  assert.match(wiz, /equip-catalog-group--registrado/);
  assert.match(wiz, /equip-catalog-group-done/);
});
