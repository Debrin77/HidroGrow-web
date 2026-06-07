/**
 * Smoke: tras cargar scripts, bienvenida y asistente disponibles (flujo reset).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

test('reset: bienvenida y asistente tras scripts listos', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(indexUrl, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(
    () => typeof hcAppScriptsListos === 'function' && hcAppScriptsListos(),
    { timeout: 120000 }
  );

  const scripts = await page.evaluate(() => ({
    abrirSetupNuevaTorre: typeof abrirSetupNuevaTorre,
    abrirSetup: typeof abrirSetup,
    mostrarBienvenidaOContinuarArranque: typeof mostrarBienvenidaOContinuarArranque,
  }));
  assert.equal(scripts.abrirSetupNuevaTorre, 'function');
  assert.equal(scripts.mostrarBienvenidaOContinuarArranque, 'function');

  for (const d of '2506') {
    await page.locator('.pin-key[data-digit="' + d + '"]').click();
    await page.waitForTimeout(100);
  }
  await page.waitForFunction(
    () => document.getElementById('pinScreen')?.style.display === 'none',
    { timeout: 60000 }
  );

  await page.evaluate(() => {
    localStorage.setItem('hc_forzar_bienvenida_tras_reset', '1');
    mostrarBienvenidaOContinuarArranque();
  });
  await page.waitForTimeout(400);

  const welcome = await page.evaluate(() => ({
    open: document.body.classList.contains('hc-welcome-open'),
    hidden: document.getElementById('welcomeOverlay')?.classList.contains('setup-hidden'),
  }));
  assert.equal(welcome.open, true, 'bienvenida debe abrirse con flag de reset');
  assert.equal(welcome.hidden, false);

  await page.evaluate(() => {
    cerrarBienvenidaPrimeraVez();
  });
  await page.waitForTimeout(1000);

  const setup = await page.evaluate(() => ({
    open: document.getElementById('setupOverlay')?.classList.contains('open'),
  }));
  assert.equal(setup.open, true, 'asistente debe abrirse tras cerrar bienvenida');

  await browser.close();
});
