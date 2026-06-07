/** Simula móvil: PIN rápido antes de que terminen los diferidos. */
import { chromium, devices } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(indexUrl, { waitUntil: 'load', timeout: 120000 });

// PIN en cuanto critical listo (sin esperar diferidos)
await page.waitForFunction(
  () => typeof hcAppScriptsListos === 'function' && hcAppScriptsListos(),
  { timeout: 120000 }
);
const snapEarly = await page.evaluate(() => ({
  bootDone: !!window._hcBootLoadDone,
  essentialDone: typeof hcBootEssentialListos === 'function' ? hcBootEssentialListos() : false,
  updateDashboard: typeof updateDashboard,
  renderTorre: typeof renderTorre,
  listos: hcAppScriptsListos(),
}));
console.log('Al desbloquear PIN:', snapEarly);
if (!snapEarly.essentialDone || snapEarly.updateDashboard !== 'function' || snapEarly.renderTorre !== 'function') {
  console.error('FALLO: PIN desbloqueado sin esenciales');
  process.exitCode = 1;
}

for (const d of '2506') {
  await page.locator('.pin-key[data-digit="' + d + '"]').click();
  await page.waitForTimeout(50);
}
await page.waitForFunction(() => appBootstrapped === true, { timeout: 60000 });

const snapAfterPin = await page.evaluate(() => ({
  bootDone: !!window._hcBootLoadDone,
  updateDashboard: typeof updateDashboard,
  renderTorre: typeof renderTorre,
}));
console.log('Tras PIN (inmediato):', snapAfterPin);

await page.evaluate(() => goTab('sistema'));
await page.waitForTimeout(500);
const snap500 = await page.evaluate(() => ({
  bootDone: !!window._hcBootLoadDone,
  renderTorre: typeof renderTorre,
  torreLen: (document.getElementById('torreSVGWrap')?.innerHTML || '').length,
}));
console.log('Sistema +500ms:', snap500);

await page.waitForFunction(
  () => typeof renderTorre === 'function' && (document.getElementById('torreSVGWrap')?.innerHTML || '').length > 500,
  { timeout: 30000 }
).catch(() => null);
const snapFinal = await page.evaluate(() => ({
  bootDone: !!window._hcBootLoadDone,
  torreLen: (document.getElementById('torreSVGWrap')?.innerHTML || '').length,
}));
console.log('Sistema final:', snapFinal);
if (errors.length) console.log('Errores:', errors.slice(0, 5));

await browser.close();
