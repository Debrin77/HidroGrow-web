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
    /if \(cam === 'semilla_hidro'\) \{[\s\S]*SETUP_PAGE_PREMIUM_5[\s\S]*SETUP_PAGE_EQUIP[\s\S]*SETUP_PAGE_AGUA[\s\S]*SETUP_PAGE_NUTRIENTES[\s\S]*SETUP_PAGE_CULTIVOS[\s\S]*SETUP_PAGE_RESUMEN[\s\S]*return skip/
  );
  assert.match(cultivo, /function hcCaminoSemillaHidroSetupGerm/);
  assert.match(cultivo, /SETUP_PAGE_GEOMETRY[\s\S]*semilla_hidro/);
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
  assert.doesNotMatch(montaje, /id: 'ph_oscuridad'/);
  assert.doesNotMatch(montaje, /id: 'ph_luz'/);
  assert.match(montaje, /renderPrepHidroOscuridadBannerHtml/);
  assert.doesNotMatch(montaje, /id: 'prop_luz'/);
  assert.doesNotMatch(montaje, /id: 'prop_higiene'/);
  assert.match(montaje, /ph_sem_una/);
  assert.match(montaje, /prepHidroRangoLlenadoGermCm/);
  assert.match(montaje, /renderPrepHidroGuiaGermHtml/);
  assert.match(montaje, /PREP_HIDRO_DIAS_OSCURIDAD = 2/);
});

test('checklist 4-5: hub 6 fases obligatorias y anillo por fases', () => {
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(germ, /camGerm !== 'semilla_propagador' && camGerm !== 'semilla_hidro'/);
  assert.match(germ, /6 fases obligatorias/);
  assert.match(germ, /function renderGermHubSemillaHidroCompactHtml/);
  assert.match(germ, /compactHidro/);
  assert.match(germ, /id: 'higiene'/);
  assert.match(germ, /Semilla a oscuras/);
  assert.match(
    germ,
    /camGermHub === 'semilla_propagador' \? pctProgresoPropagadorDias\(cfg, g\) : pctProgreso\(g\)/
  );
  assert.match(germ, /function germinacionConcluida/);
  assert.match(germ, /return fasesCompletadas\(g\)/);
});

test('checklist 6: medir cubo pre-traslado y propagador separados', () => {
  const medir = read('js/hc-medir-germinacion.js');
  const fase = read('js/hc-camino-fase.js');
  const flujo = read('js/hc-camino-flujo-ui.js');
  assert.match(medir, /function hcMedirModoGerminacionCubo/);
  assert.match(medir, /hcMedirGermPreTrasladoActivo/);
  assert.match(medir, /hcPropagadorTrasladoCompletado\(cfg\)/);
  assert.match(fase, /function hcSemillaHidroTrasladoCompletado/);
  assert.match(fase, /hcSemillaHidroTrasladoCompletado\(cfg\)/);
  assert.match(fase, /hcPropagadorTrasladoCompletado\(cfg\)/);
  assert.match(flujo, /hcPropagadorTrasladoCompletado\(cfg\)/);
  assert.match(flujo, /Sistema hidropónico/);
  const layout = read('js/hc-medir-sala-layout.js');
  assert.match(layout, /hcMedirGermPreTrasladoActivo/);
});

test('aviso oscuridad dias 1-2 en hub propagador e hidro', () => {
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(germ, /GERMINACION_DIAS_OSCURIDAD_RECOMENDADOS = 2/);
  assert.match(germ, /renderHubOscuridadGerminacionHtml/);
  assert.match(germ, /renderHubCupulaGermHidroHtml/);
  assert.match(germ, /renderHubLlenadoGermHidroHtml/);
  assert.match(germ, /1 semilla por cubo/);
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
  assert.match(prop, /caminoGuardadoEnCfg/);
  assert.match(prop, /preparacionGermHidroChecks/);
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /function hcSiguientePasoSemillaHidro/);
  assert.match(cultivo, /asistenteSetupActivo/);
  assert.match(cultivo, /leerCaminoDeObj/);
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

test('salaPreGermConfigurada: solo equipamiento de sala, no propagador ni medidas sueltas', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(cultivo, /SALA_EQUIP_INST_KEYS/);
  assert.match(cultivo, /instTieneEquipamientoSalaRegistrado\(inst\)/);
  assert.doesNotMatch(
    cultivo,
    /function salaPreGermConfigurada\(cfg\)[\s\S]{0,320}Object\.keys\(inst\)\.some/
  );
  assert.doesNotMatch(
    cultivo,
    /function salaPreGermConfigurada\(cfg\)[\s\S]{0,320}growRoomAnchoM/
  );
});

test('Medir propagador: ocultar bloque sala hasta montaje verificado', () => {
  const medir = read('js/hc-medir-germinacion.js');
  assert.match(medir, /hcMedirOcultarBloqueSala/);
  assert.match(
    medir,
    /cam === 'semilla_propagador'[\s\S]{0,120}montajeSalaPreGermOk\(cfg\)/
  );
  assert.match(medir, /refreshMedirHrDomoCardHint/);
  assert.match(medir, /HR bajo el domo/);
});

test('propagador: higrómetro en catálogo inicial de germinación', () => {
  const cat = read('js/hc-equipamiento-catalog.js');
  assert.match(cat, /higrometro_germ/);
  assert.match(cat, /keys:\s*\['propagador',\s*'higrometro_germ',\s*'mat_termica_germ'\]/);
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
  assert.match(torres, /function hcDedupTorresInstalacionGemelas/);
  assert.doesNotMatch(torres, /g\.numSemillas\) && g\.numSemillas >= 1/);
});

test('setup: primera instalacion no duplica ranura (migracion bloqueada en asistente)', () => {
  const torres = read('js/app-hc-torres-badges-notifs.js');
  const bootstrap = read('js/hc-bootstrap-state.js');
  const setup = read('js/hc-setup-calc-core.js');
  assert.match(torres, /function hcBloquearMigracionTorresDuranteSetup/);
  assert.match(
    torres,
    /hcBloquearMigracionTorresDuranteSetup\(\) && !state\.torres\.length\) return/
  );
  assert.match(
    bootstrap,
    /function hidrogrowAsegurarTorresSlotEnSnapshot[\s\S]{0,420}hidrogrowSesionNuevaInstalacionActiva/
  );
  assert.match(setup, /esPrimeraInstalacionGuardada[\s\S]{0,120}initTorres\(\)/);
  assert.match(setup, /if \(esPrimeraInstalacionGuardada\) \{[\s\S]{0,80}state\.torres = \[nuevaTorre\]/);
});

test('multi-instalacion: hidro y propagador independientes (sin fusionar ni borrar)', () => {
  const torres = read('js/app-hc-torres-badges-notifs.js');
  const setup = read('js/hc-setup-calc-core.js');
  assert.match(torres, /function hcSlotInstalacionEsReal/);
  assert.match(torres, /Instalaciones independientes/);
  assert.doesNotMatch(torres, /existIdx >= 0 && hcPuntajeSlotInstalacionReal/);
  assert.doesNotMatch(
    setup,
    /soloFantasmas[\s\S]{0,120}esPrimeraInstalacionGuardada/
  );
  assert.match(setup, /state\.torres\.push\(nuevaTorre\)/);
});

test('propagador: no tratar germinacionFlow por defecto como instalacion real', () => {
  const torres = read('js/app-hc-torres-badges-notifs.js');
  assert.match(torres, /function hcPuntajeSlotInstalacionReal/);
  assert.match(torres, /numSemillasGermManual/);
  assert.match(torres, /hcPropagadorGermAsistenteGuardadoAt/);
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
  assert.match(prop, /Preparación · germinación en el hidro/);
  assert.match(prop, /esRutaGermHidro\(cfg\)/);
  assert.match(fase, /pend\.push\('prep hidro'\)/);
  assert.match(fase, /checklist operativa y matriz/);
  assert.match(sis, /esquema DWC\/RDWC<\/strong> de arriba es la vista del sistema/);
  assert.match(onboard, /checklist <strong>operativa<\/strong> y registro en matriz/);
  assert.match(nut, /Nutriente · germinación en cubo/);
  assert.match(nut, /EC baja, ~200–400 µS/);
  assert.match(origen, /no hay segundo paso hidro/);
  assert.match(html, /Prep cubo — sala — 6 fases en Inicio/);
});

test('semilla_hidro: Inicio hub sin matriz cubos ni llenado durante germinacion', () => {
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(germ, /function hubMuestraGuiaLlenadoGermHidro[\s\S]{0,420}germ_cubo/);
  assert.match(germ, /function hubMuestraGuiaLlenadoGermHidro[\s\S]{0,500}depositoListo/);
  assert.doesNotMatch(
    germ,
    /function renderGermHubSemillaHidroCompactHtml[\s\S]{0,2800}renderGermHidroNetPotViz/
  );
  assert.match(germ, /Guía de las 6 fases/);
  assert.match(germ, /Esquema DWC y fase de crecimiento/);
});

test('semilla_hidro: esquema DWC visible en Sistema durante germinacion en cubo', () => {
  const fase = read('js/hc-camino-fase.js');
  const sis = read('js/hc-sistema-fase-camino.js');
  assert.match(fase, /function hcSistemaSemillaHidroMuestraEsquemaDwc[\s\S]{0,280}prep_hidro/);
  assert.match(fase, /function hcSistemaSemillaHidroMuestraEsquemaDwc[\s\S]{0,320}germ_cubo/);
  assert.match(fase, /function hcSubtituloEsquemaSemillaHidro/);
  assert.match(sis, /esquemaGermHidro[\s\S]{0,1200}renderTorre/);
  assert.match(sis, /esquemaGermHidro[\s\S]{0,1200}applySistemaEsquemaChromeSemillaHidro/);
});

test('semilla_hidro operativa: esquema DWC no bloqueado por fase germ_cubo', () => {
  const fase = read('js/hc-camino-fase.js');
  const torre = read('js/torre-render-main.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  const sis = read('js/hc-sistema-fase-camino.js');
  const nav = read('js/hc-bootstrap-init-nav.js');
  assert.match(fase, /function hcRenderTorreBloqueadoPorFaseCamino/);
  assert.match(fase, /semilla_hidro.*hidroCerrado/);
  assert.match(torre, /hcRenderTorreBloqueadoPorFaseCamino/);
  assert.match(torre, /hcRenderPropagadorSvg/);
  assert.match(cultivo, /function hcSyncTorreDesdeGerminacionSiAplica/);
  assert.match(cultivo, /semilla_hidro[\s\S]*hidroInstalacionCerrada/);
  assert.match(sis, /renderTorre\(\)/);
  assert.match(nav, /hcRenderTorreBloqueadoPorFaseCamino/);
  assert.match(sis, /hcSyncTorreDesdeGerminacionSiAplica/);
});

test('semilla_hidro operativa: Sistema sin EC/pH y depósito colapsable', () => {
  const fase = read('js/hc-camino-fase.js');
  const setup = read('js/hc-setup-wizard-core.js');
  const sis = read('js/hc-sistema-fase-camino.js');
  const dwc = read('js/hc-setup-wizard-dwc.js');
  assert.match(fase, /function hcSistemaOcultarEcPhStrategy/);
  assert.match(fase, /function hcSistemaDwcPanelColapsado/);
  assert.match(fase, /function hcSistemaDwcSoloConsulta/);
  assert.match(setup, /function applySistemaDwcSoloConsultaUi/);
  assert.match(setup, /hcBloquearEdicionSistemaDwcSiConsulta/);
  assert.match(dwc, /hcBloquearEdicionSistemaDwcSiConsulta/);
  assert.match(sis, /function applySistemaSemillaHidroOperativaChrome/);
  const chromeIds = sis.match(/var TORRE_HIDRO_CHROME_IDS = \[([\s\S]*?)\];/);
  assert.ok(chromeIds, 'TORRE_HIDRO_CHROME_IDS definido');
  assert.doesNotMatch(chromeIds[1], /sistemaEcPhStrategyCard/);
});

test('checklist prep hidro: iconos SVG y vista net pot', () => {
  const montaje = read('js/hc-propagador-montaje.js');
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(montaje, /PROP_ICON_SVG/);
  assert.match(montaje, /hc-pm-card-ico-svg/);
  assert.match(germ, /function renderGermHidroNetPotViz/);
  assert.match(germ, /htmlNetPotSchematicSvg/);
});

test('semilla_hidro configurado: recarga completa oculta en UI, lógica interna activa', () => {
  const fase = read('js/hc-camino-fase.js');
  const layout = read('js/hc-medir-sala-layout.js');
  const dash = read('js/meteo-forecast-dashboard.js');
  assert.match(fase, /function hcRecargaUiVisibleUsuario/);
  assert.match(fase, /hcMedirEsSemillaHidro\(cfg\)/);
  assert.match(fase, /hcSemillaHidroTrasladoCompletado/);
  assert.match(layout, /function ocultarRecargaUiSemillaHidro/);
  assert.match(layout, /hcRecargaUiVisibleUsuario/);
  assert.match(layout, /medirRecargaVolAvisoSlim/);
  assert.match(dash, /function refreshMedirRecargaVolAvisoSlim/);
  assert.match(dash, /hcMedirEsSemillaHidro\(cfgConfirm\)/);
});

test('semilla_hidro: hub visible durante germ y postAsistente solo tras matriz', () => {
  const fase = read('js/hc-camino-fase.js');
  const germ = read('js/hc-germinacion-flow.js');
  assert.match(fase, /function hcSemillaHidroHubEsPrincipal/);
  assert.match(fase, /if \(typeof hcGerminacionActiva === 'function' && hcGerminacionActiva\(cfg\)\) return false/);
  assert.doesNotMatch(germ, /hcSemillaHidroPostAsistenteUi/);
});

test('propagador: Medir oculta sala hasta montaje verificado', () => {
  const medir = read('js/hc-medir-germinacion.js');
  assert.match(medir, /function ensureMedirHrDomoEnPropagadorGrid/);
  assert.match(medir, /ocultarSalaHastaMontaje/);
  assert.match(medir, /hcMedirSalaPendienteHint/);
  const toast = read('js/app-hc-medicion-toast.js');
  assert.match(toast, /!hcMedirSalaListaParaMedir\(state\.configTorre/);
});

test('propagador: sala configurable durante germinación (no solo tras concluir)', () => {
  const luz = read('js/hc-luz-equip-sync.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  const fase = read('js/hc-camino-fase.js');
  const catalog = read('js/hc-equipamiento-catalog.js');
  const germ = read('js/hc-germinacion-flow.js');
  const propMontaje = read('js/hc-propagador-montaje.js');
  assert.match(luz, /function hcPropagadorSalaRecoEnGermHub/);
  assert.match(luz, /function hcPropagadorPendienteSalaEnInicio/);
  assert.match(luz, /function hcPropagadorInicioOcultarCuadroGermFases/);
  assert.match(luz, /getEquipamientoSalaOpcionalPendiente/);
  assert.doesNotMatch(
    luz,
    /hcPropagadorPendienteSalaEnInicio[\s\S]{0,420}!global\.germinacionConcluida\(cfg\)/
  );
  assert.match(catalog, /sala_indispensable/);
  assert.match(catalog, /sala_opcional/);
  assert.match(cultivo, /id: 'sala_cfg'[\s\S]*id: 'fases6'/);
  assert.match(fase, /hcPropagadorInicioOcultarCuadroGermFases/);
  assert.match(fase, /dashSalaEquipReco/);
  assert.match(germ, /hcMostrarMonitorDomoSalaPropagador/);
  assert.match(germ, /g\.trasladoAt\) return false/);
  assert.match(luz, /hcAbrirMontajeSalaChecklist/);
  assert.match(propMontaje, /function refreshMontajeInicioHubVisibility/);
  assert.doesNotMatch(
    propMontaje,
    /montajeInicioUsaHubPropagador\(cfg\)\)\s*\|\|\s*\(cam === 'semilla_hidro'/
  );
});

test('arranque: IIFE exportan a window (PIN y germinación)', () => {
  const germ = read('js/hc-germinacion-flow.js');
  const nut = read('js/hc-premium-nutriente-germ.js');
  assert.match(germ, /\(function \(global\)/);
  assert.match(germ, /\}\)\(typeof window !== 'undefined' \? window : globalThis\);/);
  assert.match(nut, /\(function \(global\)/);
  assert.match(nut, /\}\)\(typeof window !== 'undefined' \? window : globalThis\);/);
});

test('nutriente germ: variedad no obligatoria en clima antes del paso genética', () => {
  const nut = read('js/hc-premium-nutriente-germ.js');
  const wiz = read('js/hc-premium-wizard.js');
  assert.match(nut, /function debeExigirVariedadEnNutrienteGerm/);
  assert.match(nut, /hcCaminoSemillaPropagadorSetupGerm/);
  assert.match(nut, /SETUP_PAGE_PREMIUM_6/);
  assert.match(nut, /debeExigirVariedadEnNutrienteGerm\(\) && !getPremiumGermVariedadId\(\)/);
  assert.match(nut, /persistVariedadGermFromUI/);
  assert.match(nut, /setupPremiumVariedadGermSelect/);
  assert.match(wiz, /persistVariedadGermFromUI/);
});

test('catálogo: genetics-db en boot manifest y helper por id', () => {
  const manifest = read('js/hc-boot-manifest.js');
  const cfg = read('js/hc-bootstrap-config.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  const iGen = manifest.indexOf('genetics-db.js');
  const iCult = manifest.indexOf('cultivos-db.js');
  const iPrem = manifest.indexOf('hc-premium-wizard.js');
  assert.ok(iGen >= 0 && iCult >= 0 && iPrem >= 0, 'scripts de catálogo en boot manifest');
  assert.ok(iGen < iPrem && iCult < iPrem, 'genetics y cultivos-db antes del asistente premium');
  assert.match(cfg, /function getDiasCosechaVariedad/);
  assert.match(cfg, /if \(c\.id\) out\[c\.id\]/);
  assert.match(cultivo, /camAj !== 'semilla_propagador' && camAj !== 'semilla_hidro'/);
});

test('propagador: banner sala abre equipamiento, no selector de camino', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(
    cultivo,
    /hcPropagadorAsistenteGermPendiente\(cfg\)[\s\S]*!opts\.duranteGerminacion[\s\S]*!germActiva/
  );
  assert.match(cultivo, /abrirConfiguradorEquipamientoSalaPropagador[\s\S]*duranteGerminacion: true/);
});

test('propagador: guardar sala no borra camino ni plan de semillas', () => {
  const setup = read('js/hc-setup-calc-core.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  const puesta = read('js/hc-puesta-marcha.js');
  assert.match(setup, /hcClonePlainData\(state\.configTorre/);
  assert.match(setup, /isDwc[\s\S]*!faseGermSetup[\s\S]*!faseSalaPreGerm[\s\S]*redimensionarMatrizTorreDwcPreservando/);
  assert.match(setup, /hcRestaurarCfgCaminoGerminacionTrasSetupSala[\s\S]*cfgSlotAntesGuardar/);
  assert.match(cultivo, /hcPreservarCaminoGermEnCfgActiva/);
  assert.match(cultivo, /'hcSetupFase'/);
  assert.match(cultivo, /'germinacionEnPropagador'/);
  assert.match(puesta, /hcPreservarCaminoGermEnCfgActiva\(state\.configTorre\)/);
});

test('propagador: guardar asistente germ no exige formulario DWC', () => {
  const setup = read('js/hc-setup-calc-core.js');
  assert.match(setup, /if \(isDwc && !faseGermSetup && !faseSalaPreGerm\)/);
  assert.match(setup, /dwcSetupFormularioCompleto/);
  assert.match(setup, /if \(isRdwc && !faseGermSetup && !faseSalaPreGerm\)/);
  assert.match(setup, /hcCompletarGermPlanPropagadorDefaults/);
});

test('propagador: montaje domo independiente de sala (solo checklist propagador)', () => {
  const prop = read('js/hc-propagador-montaje.js');
  const onboard = read('js/hc-bootstrap-onboarding.js');
  const life = read('js/hc-instalacion-lifecycle.js');
  assert.match(prop, /return !!ch\.completedAt/);
  assert.doesNotMatch(
    prop,
    /function propagadorMontajeCompleto[\s\S]{0,220}montajeSalaPreGermOk/
  );
  assert.match(onboard, /currentTab === 'sala'[\s\S]*semilla_propagador[\s\S]*montajeSalaPreGermOk/);
  assert.match(life, /pasos\[0\]\.done = propOk/);
  assert.doesNotMatch(life, /pasos\[0\]\.done = propOk \|\| salaOk/);
});

test('propagador: catálogo asistente sin iconos visuales por equipamiento', () => {
  const wiz = read('js/hc-equipamiento-wizard.js');
  assert.doesNotMatch(wiz, /renderEquipCatalogCard[\s\S]{0,900}hcVisualIconSvg/);
  assert.match(wiz, /head\.textContent = cat\.label \|\| key/);
});

test('sala: ocultar sala interior riego tras montaje verificado (no solo propagador)', () => {
  const fase = read('js/hc-camino-fase.js');
  assert.match(fase, /function hcSalaOcultarPanelesDuplicadosMedir[\s\S]{0,600}montajeSalaOkCamino/);
  assert.match(fase, /function hcSalaOcultarPanelesDuplicadosMedir[\s\S]{0,600}salaConfiguradaCamino/);
});

test('semilla_hidro: primer llenado recomendado en Inicio tras sala y montaje', () => {
  const germ = read('js/hc-germinacion-flow.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(germ, /pasoPreGerm\.etapa === 'deposito_llenado'/);
  assert.match(germ, /function hubMuestraGuiaLlenadoGermHidro[\s\S]{0,420}montajeSalaPreGermOk/);
  assert.match(cultivo, /function hcSiguientePasoSemillaHidro[\s\S]{0,2200}deposito_llenado/);
});

test('propagador: primer llenado solo tras traslado al DWC', () => {
  const cultivo = read('js/hc-camino-cultivo.js');
  const life = read('js/hc-instalacion-lifecycle.js');
  assert.match(cultivo, /function hcSiguientePasoSemillaPropagadorPostGerm/);
  assert.match(cultivo, /hcPropagadorTrasladoCompletado/);
  assert.match(life, /hcSiguientePasoSemillaPropagadorPostGerm/);
});

test('semilla: fase inicial por defecto esqueje/plántula', () => {
  const prem = read('js/hc-premium-wizard.js');
  const grow = read('js/hc-grow-room.js');
  const cultivo = read('js/hc-camino-cultivo.js');
  assert.match(prem, /faseSala: 'esqueje'/);
  assert.match(grow, /growRoomFase \|\| 'esqueje'/);
  assert.match(cultivo, /faseInicial === 'germinacion'[\s\S]{0,200}esqueje/);
});
