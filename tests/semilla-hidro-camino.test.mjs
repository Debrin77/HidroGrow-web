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
    /if \(cam === 'semilla_hidro'\) \{[\s\S]*SETUP_PAGE_EQUIP[\s\S]*SETUP_PAGE_CULTIVOS[\s\S]*SETUP_PAGE_RESUMEN[\s\S]*return skip/
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
  assert.match(montaje, /ph_oscuridad/);
  assert.match(montaje, /PREP_HIDRO_DIAS_OSCURIDAD = 2/);
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

test('equipamiento hidro: medidor y bomba_aire solo en prep_hidro (sin duplicar en circuito)', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(cat, /EQUIP_PREP_HIDRO_KEYS_DEDUP/);
  assert.match(cat, /keys: \['medidor', 'bomba_aire'\]/);
  assert.match(cat, /if \(g\.id === 'hidro'\)/);
  assert.match(cat, /EQUIP_PREP_HIDRO_KEYS_DEDUP\.indexOf\(k\) < 0/);
  assert.match(cat, /piedra difusora/i);
  assert.doesNotMatch(
    cat,
    /hidroGermEquip[\s\S]{0,900}required: g\.id === 'sala' \|\| g\.id === 'hidro'/
  );
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

test('prep hidro: tras checklist navega al siguiente paso pendiente', () => {
  const prop = read('js/hc-propagador-montaje.js');
  assert.match(prop, /hcAvanzarSemillaHidroTrasPrepChecklist/);
  assert.match(prop, /hcSiguientePasoSemillaHidro/);
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /function hcSiguientePasoSemillaHidro/);
  assert.match(cultivo, /abrirSetupFaseHidro/);
  const sis = read('js/hc-sistema-fase-camino.js');
  assert.match(sis, /Siguiente:/);
  const life = read('js/hc-instalacion-lifecycle.js');
  assert.match(life, /hcSiguientePasoSemillaHidro/);
  assert.match(life, /function hcAbrirMontajeSalaChecklist/);
  const setup = read('js/hc-setup-calc-core.js');
  assert.match(setup, /wizardHidroGermCompleto[\s\S]*'germinacion'/);
});

test('semilla_hidro: plan germinación (fecha siembra) en paso Detalle origen, no en host oculto', () => {
  const germ = read('js/hc-premium-germ-plan.js');
  const flujo = read('js/hc-camino-flujo-ui.js');
  assert.match(germ, /function hcGermPlanEnPasoDetalleHidro/);
  assert.match(germ, /host\.id === 'spagePremium6'/);
  assert.match(germ, /setupPremiumFechaSiembraGerm/);
  assert.match(flujo, /getCam\(\) === 'semilla_hidro'/);
  assert.match(flujo, /setupPremiumGermPlanSection/);
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
  assert.match(doc, /checklist operativa/i);
  const flujo = read('docs/FLUJO-CAMINOS.md');
  assert.match(flujo, /SEMILLA-HIDRO-CAMINO\.md/);
});

test('semilla_hidro: cierre sin segundo asistente DWC ni copy de traslado', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const germ = read('js/hc-germinacion-flow.js');
  const life = read('js/hc-instalacion-lifecycle.js');
  assert.match(cultivo, /if \(cam === 'semilla_hidro'\) return false;/);
  assert.match(germ, /function labelsCierreGerminacion/);
  assert.match(germ, /checklistNombre: hidroDirecto \? 'Checklist operativa'/);
  assert.match(germ, /Registrar en la matriz/);
  assert.doesNotMatch(
    germ,
    /camTr === 'semilla_hidro'[\s\S]{0,200}abrirSetupFaseHidro/
  );
  assert.match(cultivo, /label: 'Checklist operativa'/);
  assert.match(cultivo, /label: 'Planta en matriz'/);
  assert.match(life, /Checklist operativa pendiente/);
});

test('semilla_hidro: plan de semillas no se muestra con defaults (solo elección usuario)', () => {
  const plan = read('js/hc-premium-germ-plan.js');
  const equip = read('js/hc-equipamiento-wizard.js');
  assert.match(plan, /function planGermResumenListo/);
  assert.match(plan, /numSemillasGermManual/);
  assert.match(plan, /sustratoGermManual/);
  assert.match(plan, /cam === 'semilla_hidro'[\s\S]{0,120}return 0/);
  assert.match(equip, /planGermResumenListo/);
  assert.doesNotMatch(
    equip,
    /Number\.isFinite\(pH\.numSemillasGerm\) && pH\.sustratoGerm/
  );
});

test('instalaciones: sync UI al cambiar torre sin mezclar caminos', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const torres = read('js/app-hc-torres-badges-notifs.js');
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(cultivo, /function hcSincronizarUiInstalacionActiva/);
  assert.match(cultivo, /global\.hcSincronizarUiInstalacionActiva/);
  assert.match(torres, /hcSincronizarUiInstalacionActiva/);
  assert.match(torres, /camCargarTorre === 'semilla_propagador' \|\| camCargarTorre === 'semilla_hidro'/);
  assert.match(germ, /function germChecklistCierreOk/);
  assert.match(germ, /checklistOperativaOk/);
  assert.match(germ, /if \(modoFijo\) g\.modo = modoFijo/);
});

test('semilla_hidro: resumen pasos orden prep → sala → hidro → depósito → fases → operativa', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const anchor = cultivo.indexOf("label: 'Prep en hidro'");
  assert.ok(anchor > 0, 'rama semilla_hidro en getCaminoResumenPasos');
  const b = cultivo.slice(anchor - 140, anchor + 2200);
  assert.match(b, /id: 'prep'/);
  assert.match(b, /id: 'hidro'/);
  assert.match(b, /id: 'deposito_pre'/);
  assert.match(b, /id: 'fases6'/);
  assert.match(b, /id: 'traslado'[\s\S]*Checklist operativa/);
  assert.match(b, /id: 'cultivo'[\s\S]*Planta en matriz/);
  const hidroPos = b.indexOf("id: 'hidro'");
  const fasesPos = b.indexOf("id: 'fases6'");
  const trasladoPos = b.indexOf("id: 'traslado'");
  assert.ok(hidroPos < fasesPos, 'DWC antes de las 6 fases');
  assert.ok(fasesPos < trasladoPos, '6 fases antes del checklist operativa');
});

test('semilla_hidro: sondas IoT en premium y sin paso Equipamiento repetido', () => {
  const equip = read('js/hc-equipamiento-wizard.js');
  const pages = read('js/hc-setup-wizard-pages.js');
  const html = read('index.html');
  assert.match(equip, /function renderPremiumSensoresIoTBlock/);
  assert.match(equip, /isSemillaHidroEquipWizard\(\)/);
  assert.match(equip, /setupPremiumSensHwEC/);
  assert.match(equip, /gateway WiFi/);
  assert.match(pages, /function setupSensHwInputs/);
  assert.match(pages, /setupPremiumSensHwEC/);
  assert.match(html, /id="setupPremiumSensoresIoTHost"/);
});

test('semilla_hidro: bomba recirc solo tras elegir RDWC, no en equipamiento previo', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(cat, /function equipSemillaHidroSinSistemaElegido/);
  assert.match(cat, /function equipCatalogIncluirBombaRecirc/);
  assert.match(cat, /!equipCatalogIncluirBombaRecirc\(\)\) return null/);
  assert.match(cat, /setupPagina < SETUP_PAGE_PREMIUM_END/);
  assert.match(cat, /if \(faseSala && camino === 'semilla_hidro'\)/);
  assert.match(cat, /return g\.id !== 'hidro'/);
  assert.match(cat, /equipCatalogTipoInstalacionHidro\(\) === 'rdwc'/);
});

test('semilla_hidro: copy sin propagador/traslado en superficies hidro', () => {
  const prop = read('js/hc-propagador-montaje.js');
  const fase = read('js/hc-camino-fase.js');
  const sis = read('js/hc-sistema-fase-camino.js');
  const onboard = read('js/hc-bootstrap-onboarding.js');
  const nut = read('js/hc-premium-nutriente-germ.js');
  const origen = read('js/hc-premium-origen-paso.js');
  const html = read('index.html');
  assert.match(prop, /Checklist <strong>prep en cubo<\/strong>/);
  assert.match(fase, /pend\.push\('prep hidro'\)/);
  assert.match(fase, /checklist operativa y matriz/);
  assert.match(sis, /checklist operativa<\/strong> y registrar la plántula/);
  assert.match(onboard, /checklist <strong>operativa<\/strong> y registro en matriz/);
  assert.match(nut, /Nutriente · germinación en cubo/);
  assert.match(nut, /EC baja, ~200–400 µS/);
  assert.match(origen, /no hay segundo paso hidro/);
  assert.match(html, /DWC\/RDWC en asistente · 6 fases en cubo/);
});

test('catálogo: CULTIVOS_DB antes de DIAS_COSECHA en index y helper por id', () => {
  const html = read('index.html');
  const cfg = read('js/hc-bootstrap-config.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  const iGen = html.indexOf('genetics-db.js');
  const iCult = html.indexOf('cultivos-db.js');
  const iBoot = html.indexOf('hc-bootstrap-config.js');
  assert.ok(iGen >= 0 && iCult >= 0 && iBoot >= 0, 'scripts de catálogo presentes');
  assert.ok(iGen < iBoot && iCult < iBoot, 'genetics y cultivos-db antes de bootstrap-config');
  assert.match(cfg, /function getDiasCosechaVariedad/);
  assert.match(cfg, /if \(c\.id\) out\[c\.id\]/);
  assert.match(cultivo, /camAj !== 'semilla_propagador' && camAj !== 'semilla_hidro'/);
});
