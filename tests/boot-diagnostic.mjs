/**
 * Diagnóstico arranque: tiempos reales PIN, scripts, pestañas.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';
const html = readFileSync(join(root, 'index.html'), 'utf8');
const syncScripts = [...html.matchAll(/<script src="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((s) => !html.includes(`defer src="${s}"`));
const deferScripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map((m) => m[1]);

console.log('=== INDEX ===');
console.log('sync scripts:', syncScripts.length);
console.log('defer scripts:', deferScripts.length);
console.log('APP_BUILD in config:', readFileSync(join(root, 'js/hc-bootstrap-config.js'), 'utf8').match(/APP_BUILD_VERSION = '([^']+)'/)?.[1]);
console.log('SW cache:', readFileSync(join(root, 'service-worker.js'), 'utf8').match(/CACHE_NAME = '([^']+)'/)?.[1]);

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const scriptEnds = [];

page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push('console:' + msg.text());
});

await page.addInitScript(() => {
  window.__hcDiag = { t0: performance.now(), marks: [] };
  const mark = (name) => {
    window.__hcDiag.marks.push({ name, ms: Math.round(performance.now() - window.__hcDiag.t0) });
  };
  document.addEventListener('DOMContentLoaded', () => mark('DOMContentLoaded'));
  window.addEventListener('load', () => mark('load'));
  new MutationObserver(() => {
    const pin = document.getElementById('pinScreen');
    if (pin && pin.style.display !== 'none' && !window.__hcDiag.pinShown) {
      window.__hcDiag.pinShown = true;
      mark('pinVisible');
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
});

const navStart = Date.now();
await page.goto(indexUrl, { waitUntil: 'commit', timeout: 120000 });

for (let i = 0; i < 120; i++) {
  const pin = await page.evaluate(() => {
    const p = document.getElementById('pinScreen');
    return p && p.style.display !== 'none';
  });
  if (pin) break;
  await page.waitForTimeout(100);
}
const pinMs = Date.now() - navStart;

await page.waitForLoadState('load', { timeout: 120000 });
const loadMs = Date.now() - navStart;

const snap = await page.evaluate(() => ({
  marks: window.__hcDiag?.marks || [],
  initApp: typeof initApp,
  goTab: typeof goTab,
  updateDashboard: typeof updateDashboard,
  renderTorre: typeof renderTorre,
  pinErr: document.getElementById('pinErr')?.textContent || '',
  splash: document.getElementById('splashScreen')?.style.display,
}));

for (const d of '2506') {
  await page.locator('.pin-key[data-digit="' + d + '"]').click();
  await page.waitForTimeout(80);
}
const unlockStart = Date.now();
await page.waitForFunction(
  () => document.getElementById('pinScreen')?.style.display === 'none',
  { timeout: 60000 }
);
const unlockMs = Date.now() - unlockStart;

const tabStart = Date.now();
await page.evaluate(() => {
  if (typeof goTab === 'function') goTab('sistema');
});
await page.waitForTimeout(3000);
const tabSnap = await page.evaluate(() => ({
  currentTab: typeof currentTab !== 'undefined' ? currentTab : null,
  torreHtml: (document.getElementById('torreSVGWrap')?.innerHTML || '').slice(0, 120),
  torreLen: (document.getElementById('torreSVGWrap')?.innerHTML || '').length,
  appBooting: document.getElementById('app')?.classList.contains('hc-app-booting'),
}));
const tabMs = Date.now() - tabStart;

console.log('\n=== TIEMPOS (ms) ===');
console.log('PIN visible:', pinMs);
console.log('window.load:', loadMs);
console.log('Tras PIN → app:', unlockMs);
console.log('Pestaña Sistema (3s wait):', tabMs);
console.log('\n=== MARCAS ===');
snap.marks.forEach((m) => console.log(`  ${m.ms}ms  ${m.name}`));
console.log('\n=== FUNCIONES TRAS LOAD ===');
console.log('initApp:', snap.initApp, 'goTab:', snap.goTab, 'updateDashboard:', snap.updateDashboard, 'renderTorre:', snap.renderTorre);
console.log('pinErr:', snap.pinErr || '(vacío)', 'splash:', snap.splash);
console.log('\n=== SISTEMA TAB ===');
console.log(JSON.stringify(tabSnap, null, 2));
if (errors.length) {
  console.log('\n=== ERRORES ===');
  errors.slice(0, 12).forEach((e) => console.log(e));
}

await browser.close();
