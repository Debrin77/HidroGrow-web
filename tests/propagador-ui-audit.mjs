/**
 * Auditoría UI real (Playwright): camino semilla_propagador.
 * Comprueba que Inicio / Medir / Sala no muestran bloques DWC duplicados.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

async function unlockPin(page) {
  await page.goto(indexUrl, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(
    () => typeof hcAppScriptsListos === 'function' && hcAppScriptsListos(),
    { timeout: 120000 }
  );
  for (const d of '2506') {
    await page.locator('.pin-key[data-digit="' + d + '"]').click();
    await page.waitForTimeout(100);
  }
  await page.waitForFunction(
    () => typeof appBootstrapped !== 'undefined' && appBootstrapped === true,
    { timeout: 90000 }
  );
}

function auditScript() {
  function isVisible(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    if (el.classList.contains('setup-hidden')) return false;
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isVisibleSelector(sel) {
    const el = document.querySelector(sel);
    if (!el) return false;
    if (el.classList.contains('setup-hidden')) return false;
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  const cfg = {
    caminoCultivo: 'semilla_propagador',
    premiumSetup: {
      caminoCultivo: 'semilla_propagador',
      variedadGerminacion: 'northern_lights',
      numSemillasGerm: 3,
      sustratoGerm: 'rockwool',
    },
    germinacionFlow: {
      numSemillas: 3,
      variedadId: 'northern_lights',
      pasos: {},
      registroDiario: [],
      fechaInicio: new Date().toISOString().slice(0, 10),
    },
    propagadorMontajeChecks: { completedAt: new Date().toISOString() },
    operativa: true,
    checklistInstalacionConfirmada: true,
    nombre: 'Propagador audit',
  };

  state.configTorre = cfg;
  state.torres = [{ nombre: 'Propagador audit', config: cfg, torre: [] }];
  state.torreActiva = 0;
  state.torre = [];

  if (typeof ensureGerminacionFlow === 'function') ensureGerminacionFlow(cfg);
  if (typeof hcSyncGerminacionPlanCultivo === 'function') hcSyncGerminacionPlanCultivo(cfg);
  if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
  if (typeof refreshDashInicioVistaCamino === 'function') refreshDashInicioVistaCamino(cfg);
  if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner(cfg);
  if (typeof hcInitMedirSalaLayout === 'function') hcInitMedirSalaLayout();
  else if (typeof mountAmbienteInMedirFlow === 'function') mountAmbienteInMedirFlow();
  if (typeof refreshTabsOperativaCamino === 'function') {
    refreshTabsOperativaCamino({ full: true, inmediato: true });
  }
  if (typeof actualizarBadgesNutriente === 'function') actualizarBadgesNutriente();
  if (typeof refreshPlantasInstalacionResumen === 'function') refreshPlantasInstalacionResumen();
  if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
  if (typeof updateDashboard === 'function') updateDashboard();

  if (typeof goTab === 'function') goTab('inicio');

  const inicio = {
    hub: isVisible('dashGerminacionHub'),
    operativaHub: isVisible('dashOperativaHub'),
    rutina: isVisible('dashRutinaDia'),
    lifecycle: isVisible('dashInstalacionLifecycle'),
    caminoResumen: isVisible('dashCaminoResumen'),
    nutriente: isVisible('dashSistemaInfo'),
    recarga: isVisible('dashRecargaCard'),
    medYcult: isVisibleSelector('.dash-medicion-y-cultivo'),
    plantasInicio: isVisible('hcPlantasInstalacionInicioDetails'),
    montajeInicio: isVisible('hcMontajeInicioDetails'),
    salaReco: isVisible('dashSalaEquipReco'),
    camino: typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '',
    sinHidro:
      typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg),
  };

  if (typeof goTab === 'function') goTab('mediciones');
  if (typeof refreshTabsOperativaCaminoForTab === 'function') {
    refreshTabsOperativaCaminoForTab('mediciones');
  }
  if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi(cfg);
  if (typeof refreshMedirPropagadorTabChrome === 'function') refreshMedirPropagadorTabChrome(cfg);
  if (typeof hcReaplicarVistasCaminoUi === 'function') hcReaplicarVistasCaminoUi(cfg);

  const faseMedir =
    typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : '';
  const medir = {
    fase: faseMedir,
    banner: isVisible('medirPropagadorFaseBanner'),
    flow: isVisible('medirFlow'),
    tempAgua: isVisible('cardTemp'),
    volumen: isVisible('cardVol'),
    hrDomo: isVisible('cardHumSala'),
    configPanel: isVisible('configPanel'),
    recarga: isVisible('recargaCardMediciones'),
    monitor: isVisible('medirMonitorCard'),
    protocolo: isVisible('medirProtocoloCard'),
    iot: isVisible('medirIotCard'),
    ambienteEnFlujo: (function () {
      var card = document.getElementById('medirAmbienteCard');
      var mount = document.getElementById('medirFlowAmbienteMount');
      return !!(card && mount && mount.contains(card) && isVisible('cardHumSala'));
    })(),
    municipio: isVisible('panelLocalidadMeteo'),
    preGate: isVisible('medirPreOperativaGate'),
    ultima: isVisible('ultimaMedicionCard'),
  };

  const btnSala = document.getElementById('btn-sala');
  const salaTabOculta = btnSala && btnSala.classList.contains('hc-tab-camino-oculta');

  if (typeof goTab === 'function') goTab('sala');
  if (typeof refreshSalaTabLight === 'function') refreshSalaTabLight(cfg);
  if (typeof hcReaplicarVistasCaminoUi === 'function') hcReaplicarVistasCaminoUi(cfg);

  const sala = {
    seguimiento: isVisible('salaSeguimientoCta'),
    flujoGuiado: isVisible('salaPropagadorFlujoGuiado'),
    layout: isVisible('salaLayoutPanel'),
    tabOculta: !!salaTabOculta,
  };

  if (typeof aplicarVisibilidadTabsCamino === 'function') {
    aplicarVisibilidadTabsCamino(cfg);
  }
  const btnRiego = document.getElementById('btn-riego');
  const riego = {
    tabOculta: !!(btnRiego && btnRiego.classList.contains('hc-tab-camino-oculta')),
    sinRiegoBody: document.body.classList.contains('hc-modo-propagador-sin-riego'),
    title: btnRiego ? btnRiego.getAttribute('title') || '' : '',
  };

  if (typeof goTab === 'function') goTab('sistema');
  if (typeof renderTorre === 'function') renderTorre();
  if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel(cfg);
  const wrap = document.getElementById('torreSVGWrap');
  const numSem =
    (cfg.germinacionFlow && cfg.germinacionFlow.numSemillas) ||
    (cfg.premiumSetup && cfg.premiumSetup.numSemillasGerm) ||
    3;
  const sistema = {
    fase: typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : '',
    propagadorSvg: !!(wrap && wrap.classList.contains('torre-svg-canvas--propagador')),
    celdasOn: wrap ? wrap.querySelectorAll('.hc-prop-cell--on').length : 0,
    numSem: numSem,
    aria: wrap ? wrap.getAttribute('aria-label') || '' : '',
  };

  return { inicio, medir, sala, riego, sistema };
}

test('propagador: Inicio banner sala (sin hub fases ni DWC duplicados)', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.inicio.camino, 'semilla_propagador');
  assert.equal(snap.inicio.sinHidro, true);
  assert.equal(snap.inicio.hub, false, 'hub germinación oculto (fases en Medir)');
  assert.equal(snap.inicio.operativaHub, false, 'dashOperativaHub');
  assert.equal(snap.inicio.rutina, false, 'dashRutinaDia');
  assert.equal(snap.inicio.lifecycle, false, 'dashInstalacionLifecycle');
  assert.equal(snap.inicio.caminoResumen, false, 'dashCaminoResumen');
  assert.equal(snap.inicio.nutriente, true, 'dashSistemaInfo debajo de instalación');
  assert.equal(snap.inicio.recarga, false, 'dashRecargaCard');
  assert.equal(snap.inicio.medYcult, false, 'dash-medicion-y-cultivo');
  assert.equal(snap.inicio.plantasInicio, false, 'plantas inicio');
  assert.equal(snap.inicio.montajeInicio, false, 'montaje inicio');
  assert.equal(snap.inicio.salaReco, true, 'banner equip sala');

  const crit = pageErrors.filter((m) => /hcReaplicar|refreshDashInicio/.test(m));
  assert.equal(crit.length, 0, pageErrors.join('; '));

  await browser.close();
});

test('propagador: Medir solo domo (sin depósito DWC)', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.medir.fase, 'propagador', 'fase sistema');
  assert.equal(snap.medir.banner, false, 'sin banner texto duplicado en germ (UI compacta)');
  assert.equal(snap.medir.flow, true, 'medirFlow');
  assert.equal(snap.medir.tempAgua, true, 'cardTemp agua propagador');
  assert.equal(snap.medir.volumen, true, 'cardVol propagador');
  assert.equal(snap.medir.hrDomo, true, 'cardHumSala HR domo');
  assert.equal(snap.medir.configPanel, false, 'configPanel');
  assert.equal(snap.medir.recarga, false, 'recargaCardMediciones');
  assert.equal(snap.medir.monitor, false, 'medirMonitorCard');
  assert.equal(snap.medir.protocolo, false, 'medirProtocoloCard');
  assert.equal(snap.medir.iot, false, 'medirIotCard');
  assert.equal(snap.medir.ambienteEnFlujo, true, 'HR domo en medirFlow');
  assert.equal(snap.medir.municipio, false, 'panelLocalidadMeteo');
  assert.equal(snap.medir.preGate, false, 'medirPreOperativaGate');

  await browser.close();
});

test('propagador: Sala sin seguimiento duplicado; pestaña accesible en germ', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.sala.tabOculta, false, 'btn-sala visible para montaje sala durante germ');
  assert.equal(snap.sala.seguimiento, false, 'salaSeguimientoCta');
  assert.equal(snap.sala.flujoGuiado, false, 'salaPropagadorFlujoGuiado');
  assert.equal(snap.sala.layout, false, 'salaLayoutPanel grow room');

  await browser.close();
});

test('propagador: Riego oculto y clase body sin depósito', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.riego.tabOculta, true, 'btn-riego oculto');
  assert.equal(snap.riego.sinRiegoBody, true, 'hc-modo-propagador-sin-riego');
  assert.match(snap.riego.title, /bandeja|depósito/i, 'tooltip riego explica bandeja');

  await browser.close();
});

test('propagador: Sistema SVG con celdas = semillas del plan', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.sistema.fase, 'propagador', 'fase sistema propagador');
  assert.equal(snap.sistema.propagadorSvg, true, 'SVG propagador renderizado');
  assert.equal(snap.sistema.celdasOn, snap.sistema.numSem, 'celdas activas = semillas');
  assert.match(snap.sistema.aria, /semillas/i, 'aria-label del SVG');

  await browser.close();
});
