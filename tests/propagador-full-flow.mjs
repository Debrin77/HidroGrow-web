/**
 * E2E Playwright: wizard semilla_propagador → guardar → checklist → hub Inicio.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

const PROP_CHECK_IDS = [
  'prop_domo',
  'prop_mat',
  'prop_dosis_sol',
  'prop_agua_sustrato',
  'prop_rockwool',
  'prop_termo',
  'prop_vent',
];

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

async function avanzarWizardPropagador(page) {
  await page.evaluate(() => {
    if (typeof abrirSetupNuevaTorre === 'function') abrirSetupNuevaTorre();
  });
  await page.waitForSelector('#setupOverlay.open', { timeout: 30000 });

  await page.evaluate(() => seleccionarCaminoCultivo('semilla_propagador'));
  await page.evaluate(() => setupNextCore());
  await page.waitForTimeout(350);

  await page.evaluate(() => {
    if (typeof seleccionarPremiumObjetivo === 'function') {
      seleccionarPremiumObjetivo('autocultivo');
    }
    setupNextCore();
  });
  await page.waitForTimeout(350);

  await page.evaluate(() => {
    if (typeof seleccionarPremiumEntorno === 'function') {
      seleccionarPremiumEntorno('interior');
    }
    setupNextCore();
  });
  await page.waitForTimeout(450);

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
          }
          break;
        }
      }
    }
    const nInp = document.getElementById('setupPremiumNumSemillasGerm');
    if (nInp) {
      nInp.value = '5';
      nInp.dispatchEvent(new Event('input', { bubbles: true }));
      nInp.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (typeof seleccionarPremiumSustratoGerm === 'function') {
      seleccionarPremiumSustratoGerm('lana');
    }
    const fInp = document.getElementById('setupPremiumFechaSiembraGerm');
    if (fInp && !fInp.value) {
      fInp.value = new Date().toISOString().slice(0, 10);
      fInp.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setupNextCore();
  });
  await page.waitForTimeout(450);

  const fin = await page.evaluate(() => {
    if (typeof ensurePremiumSetup === 'function') {
      const p = ensurePremiumSetup();
      if (!p.nutrienteGerm) p.nutrienteGerm = 'canna_aqua';
      if (!Number.isFinite(p.nutrienteGermVolL) || p.nutrienteGermVolL < 0.5) {
        p.nutrienteGermVolL = 2;
      }
    }
    const ultimo =
      typeof getSetupUltimoPasoIndice === 'function' ? getSetupUltimoPasoIndice() : 5;
    if (setupPagina < ultimo && typeof setupNextCore === 'function') {
      setupNextCore();
    }
    let ok = false;
    let planVal = null;
    if (typeof guardarSetupYContinuar === 'function') {
      ok = guardarSetupYContinuar() === true;
    }
    if (
      !ok &&
      typeof validarPlanGerminacionCompleto === 'function' &&
      state &&
      state.configTorre
    ) {
      planVal = validarPlanGerminacionCompleto(state.configTorre, {
        requierePropagador: false,
      });
    }
    return {
      setupPagina,
      ultimo,
      okGuardar: ok,
      planVal,
      camino: typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '',
      overlayOpen: document.getElementById('setupOverlay')?.classList.contains('open'),
      modalOpen: document
        .getElementById('modalPropagadorMontaje')
        ?.classList.contains('open'),
    };
  });
  if (!fin.okGuardar && !fin.modalOpen) {
    throw new Error(
      'guardar falló: pag=' +
        fin.setupPagina +
        ' ultimo=' +
        fin.ultimo +
        ' camino=' +
        fin.camino +
        ' overlay=' +
        fin.overlayOpen
    );
  }
  await page.waitForTimeout(800);
}

test('propagador: wizard completo → checklist → hub Inicio', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await unlockPin(page);
  await avanzarWizardPropagador(page);

  await page.waitForFunction(
    () => {
      const modal = document.getElementById('modalPropagadorMontaje');
      return modal && modal.classList.contains('open');
    },
    { timeout: 25000 }
  );

  const postSave = await page.evaluate(() => {
    const ov = document.getElementById('setupOverlay');
    const cfg = state && state.configTorre ? state.configTorre : {};
    return {
      setupCerrado: !ov || !ov.classList.contains('open'),
      camino: typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '',
      fase: cfg.hcSetupFase || '',
      numSem:
        (cfg.premiumSetup && cfg.premiumSetup.numSemillasGerm) ||
        (cfg.germinacionFlow && cfg.germinacionFlow.numSemillas) ||
        0,
      torres: state && state.torres ? state.torres.length : 0,
    };
  });

  assert.equal(postSave.setupCerrado, true, 'asistente cerrado tras guardar');
  assert.equal(postSave.camino, 'semilla_propagador', 'camino persistido');
  assert.equal(postSave.fase, 'germinacion', 'fase germinación');
  assert.ok(postSave.numSem >= 1, 'semillas en config');
  assert.ok(postSave.torres >= 1, 'instalación creada');

  for (const id of PROP_CHECK_IDS) {
    await page.locator('[data-prop-id="' + id + '"]').click();
    await page.waitForTimeout(80);
  }
  await page.locator('#hcPropagadorMontajeFinishBtn').click();
  await page.waitForTimeout(800);

  const fin = await page.evaluate(() => {
    const cfg = state && state.configTorre ? state.configTorre : {};
    const hub = document.getElementById('dashGerminacionHub');
    const hubVis =
      hub &&
      !hub.classList.contains('setup-hidden') &&
      String(hub.innerHTML || '').trim().length > 0;
    return {
      montajeOk:
        typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg),
      hubVis,
      tabInicio: document.getElementById('tab-inicio')?.classList.contains('active'),
      modalAbierto: document
        .getElementById('modalPropagadorMontaje')
        ?.classList.contains('open'),
      numSem:
        (cfg.germinacionFlow && cfg.germinacionFlow.numSemillas) ||
        (cfg.premiumSetup && cfg.premiumSetup.numSemillasGerm) ||
        0,
    };
  });

  assert.equal(fin.montajeOk, true, 'checklist propagador completada');
  assert.equal(fin.modalAbierto, false, 'modal checklist cerrado');
  assert.equal(fin.hubVis, true, 'hub germinación visible en Inicio');
  assert.ok(fin.numSem >= 1, 'plan semillas en germinacionFlow');

  const crit = pageErrors.filter((m) => /guardarSetup|hcFinishPropagador|validarPremium/.test(m));
  assert.equal(crit.length, 0, pageErrors.join('; '));

  await browser.close();
});
