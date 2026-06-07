/**
 * Reproduce renderListaTorres con instalación semilla_hidro.
 * Ejecutar: node tests/render-lista-torres-playwright.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CON: ${m.text()}`);
});

await page.goto(indexUrl, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(1500);

for (const d of '2506') {
  await page.locator('.pin-key[data-digit="' + d + '"]').click();
  await page.waitForTimeout(100);
}
await page.waitForFunction(
  () => typeof appBootstrapped !== 'undefined' && appBootstrapped === true,
  { timeout: 90000 }
);

const seedErr = await page.evaluate(() => {
  try {
    if (typeof state === 'undefined') return 'no state';
    state.torres = [
      {
        id: 1,
        nombre: 'Germinación · hidro test',
        emoji: '💧',
        config: {
          caminoCultivo: 'semilla_hidro',
          premiumSetup: { numSemillasGerm: 5, variedadGerminacion: 'test' },
          preparacionGermHidroChecks: { completedAt: '2026-01-01' },
          salaPreGermConfigAt: '2026-01-02',
        },
        torre: [[]],
        modoActual: 'vegetativo',
        mediciones: [],
        registro: [],
      },
      {
        id: 2,
        nombre: 'DWC segunda',
        emoji: '🌿',
        config: {
          caminoCultivo: 'semilla_hidro',
          tipoInstalacion: 'dwc',
          numNiveles: 2,
          numCestas: 4,
          nutriente: { id: 'x' },
          checklistInstalacionConfirmada: true,
        },
        torre: [[{ variedad: 'Test' }], []],
        modoActual: 'vegetativo',
        mediciones: [],
        registro: [],
      },
    ];
    state.torreActiva = 0;
    state.configTorre = state.torres[0].config;
    state.torre = state.torres[0].torre;
    return null;
  } catch (e) {
    return String(e.message || e);
  }
});

let renderErr = null;
try {
  await page.evaluate(() => {
    if (typeof renderListaTorres !== 'function') throw new Error('renderListaTorres missing');
    renderListaTorres();
  });
} catch (e) {
  renderErr = e.message;
}

const lista = await page.evaluate(() => {
  const el = document.getElementById('listaTorres');
  const mt = document.getElementById('modalTorres');
  return {
    html: el ? el.innerHTML.slice(0, 400) : null,
    modalOpen: !!(mt && mt.classList.contains('open')),
    hasErrorHint: el ? el.innerHTML.includes('No se pudo cargar') : false,
  };
});

console.log(JSON.stringify({ seedErr, renderErr, lista, errors }, null, 2));
await browser.close();
process.exit(renderErr || lista.hasErrorHint || errors.length ? 1 : 0);
