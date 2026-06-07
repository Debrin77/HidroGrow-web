/**
 * Smoke: carga index.html, PIN y comprobación de errores JS.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

test('PIN 2506 desbloquea sin error global undefined', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(indexUrl, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2500);

  for (const d of '2506') {
    await page.locator('.pin-key[data-digit="' + d + '"]').click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(4000);

  const snap = await page.evaluate(() => ({
    initApp: typeof initApp,
    appBootstrapped: typeof appBootstrapped !== 'undefined' ? appBootstrapped : null,
    pinDisplay: document.getElementById('pinScreen')?.style.display,
    appVisible: document.getElementById('app')?.style.display !== 'none',
    HC_GERMINACION_PASOS: typeof HC_GERMINACION_PASOS !== 'undefined',
    caminoUsaNutrienteBandejaPropagador: typeof caminoUsaNutrienteBandejaPropagador === 'function',
    pinErr: document.getElementById('pinErr')?.textContent || '',
  }));

  const globalUndefined = pageErrors.filter((m) => /Cannot set properties of undefined/.test(m));
  assert.equal(globalUndefined.length, 0, 'IIFE sin window: ' + globalUndefined.join('; '));
  assert.equal(snap.initApp, 'function', 'initApp debe existir');
  assert.equal(snap.HC_GERMINACION_PASOS, true, 'HC_GERMINACION_PASOS exportado');
  assert.equal(snap.caminoUsaNutrienteBandejaPropagador, true, 'caminoUsaNutrienteBandejaPropagador exportado');
  assert.equal(snap.appBootstrapped, true, 'appBootstrapped tras PIN');
  assert.equal(snap.pinErr, '', 'sin error PIN: ' + snap.pinErr);

  await browser.close();
});
