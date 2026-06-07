/**
 * Smoke Playwright: selección de camino en asistente (nueva instalación).
 * Verifica que propagador e hidro se guardan y permiten continuar.
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
    await page.waitForTimeout(120);
  }
  await page.waitForFunction(
    () => typeof appBootstrapped !== 'undefined' && appBootstrapped === true,
    { timeout: 90000 }
  );
}

async function abrirAsistenteCamino(page) {
  await page.evaluate(() => {
    if (typeof abrirSetupNuevaTorre === 'function') abrirSetupNuevaTorre();
  });
  await page.waitForSelector('#setupOverlay.open', { timeout: 30000 });
  await page.waitForFunction(
    () => {
      const el = document.getElementById('spagePremiumOrigen');
      const ov = document.getElementById('setupOverlay');
      return (
        ov &&
        ov.classList.contains('open') &&
        el &&
        el.classList.contains('active') &&
        !el.classList.contains('setup-hidden')
      );
    },
    { timeout: 20000 }
  );
}

async function leerEstadoCamino(page) {
  return page.evaluate(() => ({
    caminoPremium:
      typeof setupData !== 'undefined' && setupData.premium
        ? setupData.premium.caminoCultivo || ''
        : '',
    caminoFn: typeof getCaminoElegidoEnAsistente === 'function' ? getCaminoElegidoEnAsistente() : '',
    setupEsNuevaTorre: typeof setupEsNuevaTorre !== 'undefined' ? setupEsNuevaTorre : null,
    propagadorSelected: document
      .getElementById('setupCamino_semilla_propagador')
      ?.classList.contains('selected'),
    hidroSelected: document
      .getElementById('setupCamino_semilla_hidro')
      ?.classList.contains('selected'),
    seleccionarFn: typeof seleccionarCaminoCultivo === 'function',
    getCaminoElegidoFn: typeof getCaminoElegidoEnAsistente === 'function',
  }));
}

test('asistente: semilla_propagador se selecciona y valida', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await unlockPin(page);
  await abrirAsistenteCamino(page);

  await page.evaluate(() => seleccionarCaminoCultivo('semilla_propagador'));
  await page.waitForTimeout(300);

  const st = await leerEstadoCamino(page);
  assert.equal(st.seleccionarFn, true);
  assert.equal(st.getCaminoElegidoFn, true);
  assert.equal(st.caminoPremium, 'semilla_propagador', 'premium.caminoCultivo propagador');
  assert.equal(st.caminoFn, 'semilla_propagador', 'getCaminoElegidoEnAsistente propagador');
  assert.equal(st.propagadorSelected, true, 'UI propagador marcada');

  const ok = await page.evaluate(() => {
    return typeof validarPremiumSetupPaso === 'function'
      ? validarPremiumSetupPaso(
          typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1
        )
      : false;
  });
  assert.equal(ok, true, 'validarPremiumSetupPaso ORIGEN propagador');

  const crit = pageErrors.filter((m) => /seleccionarCaminoCultivo|validarPremiumSetupPaso/.test(m));
  assert.equal(crit.length, 0, pageErrors.join('; '));

  await browser.close();
});

test('asistente: semilla_hidro se selecciona y valida', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await unlockPin(page);
  await abrirAsistenteCamino(page);

  await page.evaluate(() => seleccionarCaminoCultivo('semilla_hidro'));
  await page.waitForTimeout(300);

  const st = await leerEstadoCamino(page);
  assert.equal(st.caminoPremium, 'semilla_hidro', 'premium.caminoCultivo hidro');
  assert.equal(st.caminoFn, 'semilla_hidro', 'getCaminoElegidoEnAsistente hidro');
  assert.equal(st.hidroSelected, true, 'UI hidro marcada');

  const ok = await page.evaluate(() => {
    return typeof validarPremiumSetupPaso === 'function'
      ? validarPremiumSetupPaso(
          typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1
        )
      : false;
  });
  assert.equal(ok, true, 'validarPremiumSetupPaso ORIGEN hidro');

  await browser.close();
});

test('propagador: APIs críticas exportadas tras PIN', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(() => ({
    hcCaminoSemillaPropagadorSetupGerm:
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function',
    hcMostrarSistemaPropagador: typeof hcMostrarSistemaPropagador === 'function',
    caminoUsaNutrienteBandejaPropagador:
      typeof caminoUsaNutrienteBandejaPropagador === 'function',
    semilla_propagador:
      typeof HC_CAMINOS_CULTIVO !== 'undefined' &&
      !!HC_CAMINOS_CULTIVO.semilla_propagador,
  }));
  assert.equal(snap.hcCaminoSemillaPropagadorSetupGerm, true);
  assert.equal(snap.hcMostrarSistemaPropagador, true);
  assert.equal(snap.caminoUsaNutrienteBandejaPropagador, true);
  assert.equal(snap.semilla_propagador, true);
  await browser.close();
});
