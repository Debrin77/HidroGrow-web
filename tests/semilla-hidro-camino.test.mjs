/**
 * Verificación estática del checklist en docs/SEMILLA-HIDRO-CAMINO.md
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

test('checklist 1: asistente hidro incluye DWC y germ en setup', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const setup = read('js/hc-setup-calc-core.js');
  assert.match(cultivo, /function hcCaminoSemillaGermEnSetup/);
  assert.match(cultivo, /global\.hcCaminoSemillaGermEnSetup/);
  assert.match(cultivo, /getCaminoCultivo\(\) === 'semilla_hidro'/);
  assert.match(cultivo, /SETUP_PAGE_PREMIUM_END/);
  assert.match(
    cultivo,
    /if \(cam === 'semilla_hidro'\) \{[\s\S]*SETUP_PAGE_CULTIVOS[\s\S]*SETUP_PAGE_RESUMEN[\s\S]*return skip/
  );
  assert.match(setup, /wizardHidroGermCompleto/);
  assert.match(setup, /salaPreGermConfigAt/);
  assert.match(setup, /transicionHidroPrepChecklist/);
});

test('checklist 2: sala visible en hidro (sin banner oculta)', () => {
  const fase = read('js/hc-camino-fase.js');
  assert.match(fase, /function hcOcultarTabSalaDuranteCamino/);
  assert.match(fase, /if \(cam\(cfg\) !== 'semilla_propagador'\) return false/);
  const flujo = read('js/hc-camino-flujo-ui.js');
  assert.match(flujo, /function propagadorSalaOcultaBannerHtml/);
  assert.match(flujo, /getCaminoCultivo\(cfg\) !== 'semilla_propagador'/);
});

test('checklist 3: sistema prep hidro e ITEMS_PREP_HIDRO', () => {
  const fase = read('js/hc-camino-fase.js');
  assert.match(fase, /prep_hidro:[\s\S]*tituloTab: 'Prep hidro'/);
  assert.match(fase, /c === 'semilla_hidro'/);
  const montaje = read('js/hc-propagador-montaje.js');
  assert.match(montaje, /var ITEMS_PREP_HIDRO/);
  assert.match(montaje, /esRutaGermHidro/);
});

test('checklist 4-5: hub 6 fases obligatorias y anillo por fases', () => {
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(germ, /camGerm !== 'semilla_propagador' && camGerm !== 'semilla_hidro'/);
  assert.match(germ, /6 fases obligatorias/);
  assert.match(
    germ,
    /camGermHub === 'semilla_propagador' \? pctProgresoPropagadorDias\(cfg, g\) : pctProgreso\(g\)/
  );
  assert.match(germ, /function germinacionConcluida/);
  assert.match(germ, /return fasesCompletadas\(g\)/);
});

test('checklist 6: medir sin modo solo-propagador en hidro', () => {
  const medir = read('js/hc-medir-germinacion.js');
  assert.match(medir, /getCaminoCultivo\(cfg\) !== 'semilla_propagador'/);
  const layout = read('js/hc-medir-sala-layout.js');
  assert.match(layout, /hcMedirModoGerminacionPropagador/);
});

test('checklist 7: fecha siembra en inicio y calendario', () => {
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(germ, /hcGermFechaSiembraInicio/);
  assert.match(germ, /persistFechaSiembraGermDesdeInicio/);
  const cal = read('js/calendario-logic.js');
  assert.match(cal, /getFechaInicioGerminacion/);
  const plan = read('js/hc-premium-germ-plan.js');
  assert.match(plan, /hcCaminoSemillaGermEnSetup/);
  assert.match(plan, /fechaSiembraGerm/);
});

test('documentación semilla hidro presente', () => {
  const doc = read('docs/SEMILLA-HIDRO-CAMINO.md');
  assert.match(doc, /semilla_hidro/);
  assert.match(doc, /Checklist de prueba manual/);
  const flujo = read('docs/FLUJO-CAMINOS.md');
  assert.match(flujo, /SEMILLA-HIDRO-CAMINO\.md/);
});
