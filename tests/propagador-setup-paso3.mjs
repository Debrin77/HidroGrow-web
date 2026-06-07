/**
 * Playwright: propagador setup — paso Espacio/Germinación debe permitir Siguiente.
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

async function abrirAsistente(page) {
  await page.evaluate(() => {
    if (typeof abrirSetupNuevaTorre === 'function') abrirSetupNuevaTorre();
  });
  await page.waitForSelector('#setupOverlay.open', { timeout: 30000 });
}

async function snapPaso3(page) {
  return page.evaluate(() => {
    const p3 =
      typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4;
    const title = document.querySelector('#spagePremium3 .setup-title');
    return {
      setupPagina: typeof setupPagina !== 'undefined' ? setupPagina : null,
      p3,
      title: title ? title.textContent : '',
      camino: typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '',
      caminoElegido:
        typeof getCaminoElegidoEnAsistente === 'function'
          ? getCaminoElegidoEnAsistente()
          : '',
      propagadorGerm:
        typeof hcCaminoSemillaPropagadorSetupGerm === 'function'
          ? hcCaminoSemillaPropagadorSetupGerm()
          : null,
      germEnSetup:
        typeof hcCaminoSemillaGermEnSetup === 'function'
          ? hcCaminoSemillaGermEnSetup()
          : null,
      esPropagadorP3:
        typeof esSetupPropagadorGermPaso3 === 'function'
          ? esSetupPropagadorGermPaso3()
          : null,
      setupEsNuevaTorre:
        typeof setupEsNuevaTorre !== 'undefined' ? setupEsNuevaTorre : null,
      germHostHidden: document
        .getElementById('setupPremiumGermAhoraHost')
        ?.classList.contains('setup-hidden'),
      germPlanHidden: document
        .getElementById('setupPremiumGermPlanSection')
        ?.classList.contains('setup-hidden'),
      premium: setupData && setupData.premium ? { ...setupData.premium } : null,
      validarP3: (() => {
        try {
          return typeof validarPremiumSetupPaso === 'function'
            ? validarPremiumSetupPaso(p3)
            : null;
        } catch (e) {
          return 'ERROR:' + (e && e.message ? e.message : String(e));
        }
      })(),
    };
  });
}

test('propagador: paso 3 permite avanzar tras elegir camino y entorno', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  await abrirAsistente(page);

  await page.evaluate(() => seleccionarCaminoCultivo('semilla_propagador'));
  await page.evaluate(() => {
    if (typeof setupNextCore === 'function') setupNextCore();
  });
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    if (typeof seleccionarPremiumObjetivo === 'function') seleccionarPremiumObjetivo('autocultivo');
    if (typeof setupNextCore === 'function') setupNextCore();
  });
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    if (typeof seleccionarPremiumEntorno === 'function') seleccionarPremiumEntorno('interior');
    if (typeof setupNextCore === 'function') setupNextCore();
  });
  await page.waitForTimeout(600);

  await page.evaluate(() => {
    if (typeof syncPremiumGermSectionPlacement === 'function') {
      syncPremiumGermSectionPlacement();
    }
    const sel = document.getElementById('setupPremiumVariedadGermSelect');
    if (sel && sel.options && sel.options.length > 1) {
      for (let i = 1; i < sel.options.length; i++) {
        const v = String(sel.options[i].value || '').trim();
        if (v) {
          sel.value = v;
          if (typeof seleccionarPremiumVariedadGerminacion === 'function') {
            seleccionarPremiumVariedadGerminacion(v);
          } else if (typeof syncVariedadGermATorre === 'function') {
            syncVariedadGermATorre(v);
          }
          break;
        }
      }
    }
  });
  await page.waitForTimeout(300);

  const st = await snapPaso3(page);
  assert.equal(st.setupPagina, st.p3, 'debe estar en paso PREMIUM_3');
  assert.equal(st.camino, 'semilla_propagador', 'getCaminoCultivo propagador');
  assert.equal(st.propagadorGerm, true, 'hcCaminoSemillaPropagadorSetupGerm');
  assert.equal(st.esPropagadorP3, true, 'esSetupPropagadorGermPaso3');
  assert.equal(
    st.title,
    'Germinación ahora',
    'título paso 3 propagador (actual: ' + st.title + ')'
  );
  assert.equal(
    st.validarP3,
    true,
    'validarPremiumSetupPaso PREMIUM_3 (resultado: ' + String(st.validarP3) + ')'
  );

  const okNext = await page.evaluate(() => {
    const prev = setupPagina;
    if (typeof setupNextCore === 'function') setupNextCore();
    return setupPagina > prev;
  });
  assert.equal(okNext, true, 'setupNextCore avanza desde paso 3');

  await browser.close();
});
