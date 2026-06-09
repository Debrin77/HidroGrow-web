/**
 * Auditoría UI (Playwright): camino semilla_hidro — Medir cubo pre-traslado vs depósito post-matriz.
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
    caminoCultivo: 'semilla_hidro',
    tipoInstalacion: 'dwc',
    origenPlanta: 'semilla',
    checklistInstalacionConfirmada: true,
    instalacionPrimerLlenadoAt: new Date().toISOString(),
    preparacionGermHidroChecks: { completedAt: new Date().toISOString() },
    salaPreGermConfigAt: new Date().toISOString(),
    puestaMarchaChecks: { completedAt: new Date().toISOString() },
    premiumSetup: {
      caminoCultivo: 'semilla_hidro',
      origenPlanta: 'semilla',
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
    operativa: true,
    nombre: 'Hidro germ audit',
  };

  state.configTorre = cfg;
  state.torres = [{ nombre: 'Hidro germ audit', config: cfg, torre: [] }];
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
    cubo: typeof hcMedirModoGerminacionCubo === 'function' && hcMedirModoGerminacionCubo(cfg),
    hidroOper:
      typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg),
    fase: typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : '',
    flow: isVisible('medirFlow'),
    tempAgua: isVisible('cardTemp'),
    volumen: isVisible('cardVol'),
    hr: isVisible('cardHumSala'),
    recarga: isVisible('recargaCardMediciones'),
    tabCubo: !!document.getElementById('tab-mediciones')?.classList.contains('medir-tab--germ-cubo'),
  };

  cfg.germinacionFlow.trasladoAt = new Date().toISOString();
  cfg.germinacionFlow.activo = false;
  if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi(cfg);
  if (typeof applyMedirSemillaHidroChrome === 'function') applyMedirSemillaHidroChrome(cfg);

  const postTraslado = {
    cubo: typeof hcMedirModoGerminacionCubo === 'function' && hcMedirModoGerminacionCubo(cfg),
    hidroOper:
      typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg),
    recargaVisible: isVisible('recargaCardMediciones'),
  };

  return { preTraslado, postTraslado };
}

test('semilla_hidro: Medir cubo pre-traslado (sin depósito operativo)', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditScript);

  assert.equal(snap.preTraslado.cubo, true, 'modo cubo activo');
  assert.equal(snap.preTraslado.hidroOper, false, 'no operativa hidro antes de matriz');
  assert.equal(snap.preTraslado.flow, true, 'medirFlow');
  assert.equal(snap.preTraslado.tempAgua, true, 'T° agua cubo');
  assert.equal(snap.preTraslado.volumen, true, 'volumen cubo');
  assert.equal(snap.preTraslado.hr, true, 'HR');
  assert.equal(snap.preTraslado.recarga, false, 'sin recarga pre-traslado');
  assert.equal(snap.preTraslado.tabCubo, true, 'clase medir-tab--germ-cubo');

  assert.equal(snap.postTraslado.cubo, false, 'modo cubo off tras traslado');
  assert.equal(snap.postTraslado.hidroOper, true, 'operativa hidro tras matriz');

  await browser.close();
});
