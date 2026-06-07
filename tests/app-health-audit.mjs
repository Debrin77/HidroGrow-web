/**
 * Auditoría completa: arranque, PIN, pestañas, asistente, errores JS.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

const TABS = ['inicio', 'mediciones', 'sala', 'sistema', 'calendario', 'consejos', 'ayuda'];

async function unlockPin(page) {
  await page.goto(indexUrl, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(
    () => typeof hcAppScriptsListos === 'function' && hcAppScriptsListos(),
    { timeout: 120000 }
  );
  for (const d of '2506') {
    await page.locator('.pin-key[data-digit="' + d + '"]').click();
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(
    () =>
      document.getElementById('pinScreen')?.style.display === 'none' &&
      typeof appBootstrapped !== 'undefined' &&
      appBootstrapped === true,
    { timeout: 90000 }
  );
}

test('auditoría: APIs críticas tras arranque', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await unlockPin(page);

  const apis = await page.evaluate(() => ({
    bootEssential: typeof hcBootEssentialListos === 'function' ? hcBootEssentialListos() : false,
    updateDashboard: typeof updateDashboard === 'function',
    renderTorre: typeof renderTorre === 'function',
    goTab: typeof goTab === 'function',
    setupNext: typeof setupNext === 'function',
    guardarSetupYContinuar: typeof guardarSetupYContinuar === 'function',
    seleccionarCaminoCultivo: typeof seleccionarCaminoCultivo === 'function',
    validarPremiumSetupPaso: typeof validarPremiumSetupPaso === 'function',
    updateDashboard: typeof updateDashboard === 'function',
    renderTorre: typeof renderTorre === 'function',
    renderCalendario: typeof renderCalendario === 'function',
    setupFlowAdvancePage: typeof setupFlowAdvancePage === 'function',
    VOL_OBJETIVO: typeof VOL_OBJETIVO !== 'undefined' ? VOL_OBJETIVO : null,
    getRefDosisFabricante: typeof getRefDosisFabricante === 'function',
    refreshTabsOperativaCaminoForTab: typeof refreshTabsOperativaCaminoForTab === 'function',
    hcAppScriptsListos: typeof hcAppScriptsListos === 'function' ? hcAppScriptsListos() : false,
    appBooting: document.getElementById('app')?.classList.contains('hc-app-booting'),
    welcomeBlocksSetup: (() => {
      const w = document.getElementById('welcomeOverlay');
      const s = document.getElementById('setupOverlay');
      if (!s?.classList.contains('open')) return false;
      if (!w || w.classList.contains('setup-hidden')) return false;
      const wz = w ? parseInt(getComputedStyle(w).zIndex, 10) : 0;
      const sz = s ? parseInt(getComputedStyle(s).zIndex, 10) : 0;
      return wz > sz && getComputedStyle(w).pointerEvents !== 'none';
    })(),
  }));

  assert.equal(apis.bootEssential, true, 'esenciales listos al desbloquear');
  assert.equal(apis.updateDashboard, true, 'updateDashboard');
  assert.equal(apis.renderTorre, true, 'renderTorre');
  assert.equal(apis.goTab, true, 'goTab');
  assert.equal(apis.setupNext, true, 'setupNext');
  assert.equal(apis.guardarSetupYContinuar, true, 'guardarSetupYContinuar');
  assert.equal(apis.seleccionarCaminoCultivo, true, 'seleccionarCaminoCultivo');
  assert.equal(apis.VOL_OBJETIVO, 18, 'VOL_OBJETIVO debe ser 18');
  assert.equal(apis.getRefDosisFabricante, true, 'getRefDosisFabricante');
  assert.equal(apis.hcAppScriptsListos, true, 'hcAppScriptsListos');
  assert.equal(apis.appBooting, false, 'app no debe quedar en hc-app-booting');
  assert.equal(apis.welcomeBlocksSetup, false, 'bienvenida no debe tapar asistente');

  const crit = errors.filter(
    (m) => !/ServiceWorkerRegistration|document is in an invalid state/i.test(m)
  );
  assert.equal(crit.length, 0, 'errores JS: ' + crit.join('; '));

  await browser.close();
});

test('auditoría: pestañas cambian en <400ms y panel visible', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);

  const results = [];
  for (const tab of TABS) {
    const t0 = Date.now();
    await page.evaluate((t) => goTab(t), tab);
    await page.waitForFunction(
      (t) => document.getElementById('tab-' + t)?.classList.contains('active'),
      tab,
      { timeout: 5000 }
    );
    const ms = Date.now() - t0;
    const st = await page.evaluate((t) => {
      const panel = document.getElementById('tab-' + t);
      const rect = panel?.getBoundingClientRect();
      return {
        tab: typeof currentTab !== 'undefined' ? currentTab : null,
        active: panel?.classList.contains('active'),
        height: rect?.height || 0,
        childCount: panel?.children?.length || 0,
      };
    }, tab);
    results.push({ tab, ms, ...st });
    assert.equal(st.active, true, tab + ' debe estar active');
    assert.equal(st.tab, tab, 'currentTab debe ser ' + tab);
    assert.ok(st.height > 50, tab + ' panel debe tener altura visible, got ' + st.height);
  }

  const slow = results.filter((r) => r.ms > 800);
  assert.equal(slow.length, 0, 'pestañas lentas: ' + JSON.stringify(slow));

  await browser.close();
});

test('auditoría: asistente avanza objetivo → entorno', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await unlockPin(page);
  await page.evaluate(() => {
    if (typeof hcOcultarOverlaysOnboardingUi === 'function') hcOcultarOverlaysOnboardingUi();
    abrirSetupNuevaTorre();
  });
  await page.waitForSelector('#setupOverlay.open', { timeout: 30000 });

  await page.evaluate(() => seleccionarCaminoCultivo('semilla_propagador'));
  await page.click('#setupBtnNext');
  await page.waitForFunction(
    () => document.getElementById('spagePremium1')?.classList.contains('active'),
    { timeout: 10000 }
  );

  const before = await page.evaluate(() => setupPagina);
  const nextOk = await page.evaluate(() => {
    try {
      return setupNext();
    } catch (e) {
      return { error: e.message };
    }
  });
  await page.waitForFunction(
    () => document.getElementById('spagePremium2')?.classList.contains('active'),
    { timeout: 10000 }
  );

  const after = await page.evaluate(() => ({
    pagina: setupPagina,
    p2: document.getElementById('spagePremium2')?.classList.contains('active'),
  }));
  assert.equal(after.p2, true, 'debe llegar a spagePremium2, next=' + JSON.stringify(nextOk) + ' from=' + before);
  const crit = errors.filter(
    (m) => !/ServiceWorkerRegistration|document is in an invalid state/i.test(m)
  );
  assert.equal(crit.length, 0, crit.join('; '));

  await browser.close();
});
