/**
 * Smoke: asistente avanza de camino → objetivo/legalidad → entorno.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

async function unlockAndOpenWizard(page) {
  await page.goto(indexUrl, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(
    () =>
      typeof hcAppScriptsListos === 'function' &&
      hcAppScriptsListos() &&
      typeof guardarSetupYContinuar === 'function',
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
  await page.evaluate(() => {
    if (typeof abrirSetupNuevaTorre === 'function') abrirSetupNuevaTorre();
  });
  await page.waitForSelector('#setupOverlay.open', { timeout: 30000 });
}

test('wizard: origen → objetivo → entorno (semilla_propagador)', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await unlockAndOpenWizard(page);

  await page.evaluate(() => seleccionarCaminoCultivo('semilla_propagador'));
  await page.click('#setupBtnNext');
  await page.waitForFunction(
    () => document.getElementById('spagePremium1')?.classList.contains('active'),
    { timeout: 10000 }
  );

  await page.click('#setupBtnNext');
  await page.waitForFunction(
    () => document.getElementById('spagePremium2')?.classList.contains('active'),
    { timeout: 10000 }
  );

  const st = await page.evaluate(() => ({
    pagina: typeof setupPagina !== 'undefined' ? setupPagina : null,
    premium1: document.getElementById('spagePremium1')?.classList.contains('active'),
    premium2: document.getElementById('spagePremium2')?.classList.contains('active'),
    guardarFn: typeof guardarSetupYContinuar === 'function',
  }));
  assert.equal(st.guardarFn, true);
  assert.equal(st.premium2, true, 'debe mostrar Entorno de cultivo');
  assert.equal(st.premium1, false);
  assert.equal(st.pagina, 3, 'SETUP_PAGE_PREMIUM_2');

  assert.equal(errors.length, 0, errors.join('; '));
  await browser.close();
});
