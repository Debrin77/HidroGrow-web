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

test('aviso oscuridad dias 1-2 en hub propagador e hidro', () => {
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(germ, /GERMINACION_DIAS_OSCURIDAD_RECOMENDADOS = 2/);
  assert.match(germ, /renderHubOscuridadGerminacionHtml/);
  assert.match(germ, /semilla_propagador.*semilla_hidro/s);
  assert.match(germ, /hubMuestraAvisoOscuridadGerm/);
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

test('equipamiento hidro: cúpula por maceta, no propagador en grupo opcional', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(cat, /cupula_maceta/);
  assert.match(cat, /germ_opcional_hidro[\s\S]*keys:\s*\['cupula_maceta',\s*'mat_termica_germ'\]/);
  assert.match(cat, /hidroGermEquip/);
  const wiz = read('js/hc-equipamiento-wizard.js');
  assert.match(wiz, /isSemillaHidroEquipWizard/);
  assert.match(wiz, /cúpula individual por maceta/);
  assert.match(wiz, /equip-catalog-per-maceta/);
});

test('prep hidro: tras checklist navega a montaje si sala ya configurada', () => {
  const prop = read('js/hc-propagador-montaje.js');
  assert.match(prop, /hcAbrirMontajeSalaChecklist/);
  assert.match(prop, /salaPreGermConfigurada\(cfg2\)/);
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /salaConfiguradaCamino/);
  assert.match(cultivo, /hcAbrirMontajeSalaChecklist/);
  const life = read('js/hc-instalacion-lifecycle.js');
  assert.match(life, /function hcAbrirMontajeSalaChecklist/);
  const setup = read('js/hc-setup-calc-core.js');
  assert.match(setup, /wizardHidroGermCompleto[\s\S]*'germinacion'/);
});

test('refreshLuzOrigenUI no reentra en cargarGrowRoomUI (evita ciclo sala)', () => {
  const luz = read('js/hc-luz-equip-sync.js');
  const agua = read('js/hc-setup-agua-sustrato.js');
  assert.match(luz, /cargarInteriorGrowUI\(\{ skipGrowRoom: true \}\)/);
  assert.match(agua, /opts\.skipGrowRoom/);
});

test('salaPreGermConfigurada no llama salaConfiguradaCamino (evita stack overflow)', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const fase = read('js/hc-camino-fase.js');
  assert.match(fase, /salaPreGermConfigurada\(cfg\)/);
  assert.doesNotMatch(
    cultivo,
    /function salaPreGermConfigurada\(cfg\)[\s\S]{0,420}salaConfiguradaCamino\(cfg\)/
  );
});

test('semilla_hidro: slot con prep no es fantasma ni se filtra al cargar', () => {
  const torres = read('js/app-hc-torres-badges-notifs.js');
  const boot = read('js/hc-bootstrap-state.js');
  assert.match(torres, /cam === 'semilla_propagador' \|\| cam === 'semilla_hidro'/);
  assert.match(torres, /cfg\.preparacionGermHidroChecks/);
  assert.match(boot, /cfg\.preparacionGermHidroChecks/);
  assert.doesNotMatch(
    boot,
    /if \(cfg\.hcPlantillaAutogenerada\) return false;[\s\S]{0,80}if \(cfg\.caminoCultivo/
  );
});

test('sala: checklist montaje se pinta sin esperar idle pesado', () => {
  const layout = read('js/hc-medir-sala-layout.js');
  const nav = read('js/hc-bootstrap-init-nav.js');
  assert.match(layout, /hcRefreshPuestaMarchaUi/);
  assert.match(nav, /hcRefreshPuestaMarchaUi/);
  assert.match(nav, /updateDashboard\(\{ lite: true \}\)/);
});

test('hcDashRecargaPropagadorInfo: diasObjetivo usa diasObj (sin ReferenceError)', () => {
  const fase = read('js/hc-camino-fase.js');
  assert.match(fase, /var diasObj =[\s\S]*diasObjetivoConclusionGerm/);
  assert.doesNotMatch(fase, /diasObjetivo: diasObjetivo/);
  assert.match(fase, /diasObjetivo: diasObj/);
});

test('documentación semilla hidro presente', () => {
  const doc = read('docs/SEMILLA-HIDRO-CAMINO.md');
  assert.match(doc, /semilla_hidro/);
  assert.match(doc, /Checklist de prueba manual/);
  const flujo = read('docs/FLUJO-CAMINOS.md');
  assert.match(flujo, /SEMILLA-HIDRO-CAMINO\.md/);
});
