/**
 * Auditoría UI (Playwright): semilla_propagador — Medir domo pre-traslado vs hidro+sala post-traslado.
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

  const cfg = {
    caminoCultivo: 'semilla_propagador',
    tipoInstalacion: 'dwc',
    origenPlanta: 'semilla',
    checklistInstalacionConfirmada: true,
    salaPreGermConfigAt: new Date().toISOString(),
    puestaMarchaChecks: { completedAt: new Date().toISOString() },
    premiumSetup: {
      caminoCultivo: 'semilla_propagador',
      variedadGerminacion: 'northern_lights',
      numSemillasGerm: 2,
      sustratoGerm: 'rockwool',
      anchoM: 1.2,
      largoM: 1.2,
    },
    germinacionFlow: {
      numSemillas: 2,
      variedadId: 'northern_lights',
      pasos: {},
      registroDiario: [],
      fechaInicio: new Date().toISOString().slice(0, 10),
      activo: true,
    },
    propagadorMontajeChecks: { completedAt: new Date().toISOString() },
    operativa: true,
    nombre: 'Propagador medir audit',
  };

  state.configTorre = cfg;
  state.torres = [{ nombre: 'Propagador medir audit', config: cfg, torre: [] }];
  state.torreActiva = 0;
  state.torre = [];

  if (typeof ensureGerminacionFlow === 'function') ensureGerminacionFlow(cfg);
  if (typeof hcSyncGerminacionPlanCultivo === 'function') hcSyncGerminacionPlanCultivo(cfg);
  if (typeof hcInitMedirSalaLayout === 'function') hcInitMedirSalaLayout();
  if (typeof refreshTabsOperativaCamino === 'function') {
    refreshTabsOperativaCamino({ full: true, inmediato: true });
  }
  if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi(cfg);
  if (typeof goTab === 'function') goTab('mediciones');

  const preTraslado = {
    propagador:
      typeof hcMedirModoGerminacionPropagador === 'function' &&
      hcMedirModoGerminacionPropagador(cfg),
    tabProp: !!document.getElementById('tab-mediciones')?.classList.contains('medir-tab--propagador'),
    hrEnSolucion: (function () {
      var sol = document.getElementById('medirFlowSolucion');
      var hr = document.getElementById('cardHumSala');
      return !!(sol && hr && sol.contains(hr) && isVisible('cardHumSala'));
    })(),
    recarga: isVisible('recargaCardMediciones'),
    hub: isVisible('medirOperativaHub'),
  };

  cfg.germinacionFlow.trasladoAt = new Date().toISOString();
  cfg.germinacionFlow.activo = false;
  if (typeof refreshTabsOperativaCaminoForTab === 'function') {
    refreshTabsOperativaCaminoForTab('mediciones');
  }
  if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi(cfg);
  if (typeof refreshMedirPropagadorTabChrome === 'function') refreshMedirPropagadorTabChrome(cfg);

  const bannerEl = document.getElementById('medirPropagadorFaseBanner');
  const bannerTxt = bannerEl ? bannerEl.textContent || '' : '';

  const postTraslado = {
    propagador:
      typeof hcMedirModoGerminacionPropagador === 'function' &&
      hcMedirModoGerminacionPropagador(cfg),
    trasladoOk:
      typeof hcPropagadorTrasladoCompletado === 'function' &&
      hcPropagadorTrasladoCompletado(cfg),
    tabProp: !!document.getElementById('tab-mediciones')?.classList.contains('medir-tab--propagador'),
    tempAgua: isVisible('cardTemp'),
    volumen: isVisible('cardVol'),
    ec: isVisible('cardEC'),
    hrEnSolucion: (function () {
      var sol = document.getElementById('medirFlowSolucion');
      var hr = document.getElementById('cardHumSala');
      return !!(sol && hr && sol.contains(hr) && isVisible('cardHumSala'));
    })(),
    recarga: isVisible('recargaCardMediciones'),
    hub: isVisible('medirOperativaHub'),
    bannerHidro: /Sistema hidropónico/i.test(bannerTxt),
    bannerDomo: /Propagador:.*domo/i.test(bannerTxt),
  };

  return { preTraslado, postTraslado };
}

test('semilla_propagador: Medir domo pre-traslado y hidro post-traslado', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.preTraslado.propagador, true, 'modo propagador activo');
  assert.equal(snap.preTraslado.tabProp, true, 'clase medir-tab--propagador');
  assert.equal(snap.preTraslado.hrEnSolucion, true, 'HR domo en grid solución');
  assert.equal(snap.preTraslado.recarga, false, 'sin recarga pre-traslado');

  assert.equal(snap.postTraslado.propagador, false, 'modo propagador off tras traslado');
  assert.equal(snap.postTraslado.trasladoOk, true, 'trasladoAt registrado');
  assert.equal(snap.postTraslado.tabProp, false, 'sin clase propagador');
  assert.equal(snap.postTraslado.tempAgua, true, 'T° agua depósito');
  assert.equal(snap.postTraslado.volumen, true, 'volumen depósito');
  assert.equal(snap.postTraslado.ec, true, 'EC depósito');
  assert.equal(snap.postTraslado.hrEnSolucion, false, 'HR ya no en grid domo');
  assert.equal(snap.postTraslado.bannerHidro, true, 'banner hidro post-traslado');
  assert.equal(snap.postTraslado.bannerDomo, false, 'sin banner domo post-traslado');

  await browser.close();
});
