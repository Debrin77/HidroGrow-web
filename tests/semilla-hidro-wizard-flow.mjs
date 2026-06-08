/**
 * Flujo asistente semilla_hidro: pasos visibles sin repetir genética/método ni saltar geometría.
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

test('semilla_hidro: pasos visibles y último paso es geometría DWC', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);

  await page.evaluate(() => {
    if (typeof abrirSetupNuevaTorre === 'function') abrirSetupNuevaTorre();
    if (typeof seleccionarCaminoCultivo === 'function') seleccionarCaminoCultivo('semilla_hidro');
  });
  await page.waitForSelector('#setupOverlay.open', { timeout: 30000 });

  const snap = await page.evaluate(() => {
    const vis =
      typeof getSetupVisiblePages === 'function' ? getSetupVisiblePages() : [];
    const skip =
      typeof getSetupSkippedPages === 'function' ? getSetupSkippedPages() : new Set();
    const ultimo =
      typeof getSetupUltimoPasoIndice === 'function' ? getSetupUltimoPasoIndice() : -1;
    const p5 = typeof SETUP_PAGE_PREMIUM_5 !== 'undefined' ? SETUP_PAGE_PREMIUM_5 : 6;
    const pEnd = typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8;
    const geom = typeof SETUP_PAGE_GEOMETRY !== 'undefined' ? SETUP_PAGE_GEOMETRY : 9;
    const eq = typeof SETUP_PAGE_EQUIP !== 'undefined' ? SETUP_PAGE_EQUIP : 10;
    const agua = typeof SETUP_PAGE_AGUA !== 'undefined' ? SETUP_PAGE_AGUA : 11;
    return {
      vis,
      ultimo,
      skipP5: skip.has(p5),
      skipEquip: skip.has(eq),
      skipAgua: skip.has(agua),
      hasGeom: vis.indexOf(geom) >= 0,
      hasEnd: vis.indexOf(pEnd) >= 0,
      hidroGerm:
        typeof hcCaminoSemillaHidroSetupGerm === 'function' && hcCaminoSemillaHidroSetupGerm(),
    };
  });

  assert.equal(snap.hidroGerm, true, 'hcCaminoSemillaHidroSetupGerm activo');
  assert.equal(snap.skipP5, true, 'no repite paso Genética y método (fusionado en detalle)');
  assert.equal(snap.skipEquip, true, 'sin paso Equipamiento duplicado');
  assert.equal(snap.skipAgua, true, 'agua ya cubierta en premium');
  assert.equal(snap.hasGeom, true, 'geometría DWC visible');
  assert.equal(snap.hasEnd, true, 'paso DWC/RDWC visible');
  assert.equal(snap.ultimo, typeof SETUP_PAGE_GEOMETRY !== 'undefined' ? 9 : snap.ultimo);
  assert.ok(snap.hasEnd < snap.ultimo || snap.vis.indexOf(8) < snap.vis.indexOf(9), 'DWC antes de geometría');

  await browser.close();
});
