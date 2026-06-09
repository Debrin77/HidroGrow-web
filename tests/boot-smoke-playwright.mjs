import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl =
  process.env.HC_TEST_URL || 'file:///' + root.replace(/\\/g, '/') + '/index.html';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const logs = [];

page.on('pageerror', (e) => errors.push('PAGE: ' + e.message));
page.on('console', (m) => {
  const t = m.type();
  const text = m.text();
  if (t === 'error') errors.push('CON: ' + text);
  if (text.includes('[HidroGrow]') || text.includes('Error') || text.includes('error')) {
    logs.push(t + ': ' + text);
  }
});

await page.goto(indexUrl, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(3000);

await page.evaluate(() => {
  if (typeof state === 'undefined') return;
  state.torres = [
    {
      id: 1,
      nombre: 'Germinación · propagador',
      emoji: '🫧',
      config: {
        caminoCultivo: 'semilla_propagador',
        hcPropagadorGermAsistenteGuardadoAt: '2026-01-01',
        germinacionFlow: {
          pasos: { semilla: { doneAt: null } },
          ultimaDomo: {},
        },
        premiumSetup: { numSemillasGerm: 3, variedadGerminacion: 'test' },
      },
      torre: [[{ variedad: '', fecha: '' }]],
      modoActual: 'vegetativo',
      mediciones: [],
      registro: [],
    },
  ];
  state.torreActiva = 0;
  state.configTorre = state.torres[0].config;
  state.torre = state.torres[0].torre;
});

await page.waitForTimeout(2000);

const snap = await page.evaluate(() => ({
  pinVisible: (() => {
    const el = document.getElementById('pinScreen');
    return el ? getComputedStyle(el).display !== 'none' : null;
  })(),
  appVisible: (() => {
    const el = document.getElementById('app');
    return el ? getComputedStyle(el).display !== 'none' : null;
  })(),
  splashVisible: (() => {
    const el = document.getElementById('splashScreen');
    return el ? getComputedStyle(el).display !== 'none' : null;
  })(),
  hcAppScriptsListos: typeof hcAppScriptsListos === 'function' ? hcAppScriptsListos() : 'missing',
  initApp: typeof initApp,
  updateDashboard: typeof updateDashboard,
  criticalDone: typeof criticalDone !== 'undefined' ? criticalDone : 'n/a',
  pinStatus: document.getElementById('pinAuthStatus')?.textContent || '',
  build: typeof APP_BUILD_VERSION !== 'undefined' ? APP_BUILD_VERSION : '?',
}));

for (const d of '2506') {
  await page.locator('.pin-key[data-digit="' + d + '"]').click();
  await page.waitForTimeout(80);
}

let afterPin = null;
try {
  await page.waitForFunction(
    () => typeof appBootstrapped !== 'undefined' && appBootstrapped === true,
    { timeout: 45000 }
  );
  afterPin = await page.evaluate(() => ({
    bootstrapped: appBootstrapped,
    tab: typeof currentTab !== 'undefined' ? currentTab : '?',
    pinHidden: (() => {
      const el = document.getElementById('pinScreen');
      return el ? getComputedStyle(el).display === 'none' : null;
    })(),
    greeting: document.getElementById('dashGreeting')?.textContent || '',
  }));
} catch (e) {
  afterPin = { error: String(e.message || e) };
  const extra = await page.evaluate(() => ({
    pinStatus: document.getElementById('pinAuthStatus')?.textContent || '',
    pinErr: document.getElementById('pinErr')?.textContent || '',
    appBootstrapped: typeof appBootstrapped !== 'undefined' ? appBootstrapped : 'undef',
  }));
  afterPin.extra = extra;
}

console.log(JSON.stringify({ snap, afterPin, errors, logs }, null, 2));
await browser.close();
process.exit(errors.length && !afterPin?.bootstrapped ? 1 : afterPin?.bootstrapped ? 0 : 1);
