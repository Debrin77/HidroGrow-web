/**
 * Flujo asistente coco+goteo: fases, skips y persistencia (runtime).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadCaminoStack(extraCtx = {}) {
  const ctx = vm.createContext({
    console,
    window: {},
    globalThis: {},
    state: {
      configTorre: {
        caminoCultivo: 'semilla_coco_drip',
        hcSetupFase: 'germinacion',
        germinacionFlow: {},
      },
    },
    setupEsNuevaTorre: false,
    setupPagina: 7,
    SETUP_PAGE_WELCOME: 0,
    SETUP_PAGE_ORIGEN: 1,
    SETUP_PAGE_PREMIUM_START: 2,
    SETUP_PAGE_PREMIUM_1: 2,
    SETUP_PAGE_PREMIUM_2: 3,
    SETUP_PAGE_PREMIUM_3: 4,
    SETUP_PAGE_PREMIUM_4: 5,
    SETUP_PAGE_PREMIUM_5: 6,
    SETUP_PAGE_PREMIUM_6: 7,
    SETUP_PAGE_PREMIUM_END: 8,
    SETUP_PAGE_GEOMETRY: 9,
    SETUP_PAGE_EQUIP: 10,
    SETUP_PAGE_AGUA: 11,
    SETUP_PAGE_NUTRIENTES: 12,
    SETUP_PAGE_UBICACION: 13,
    SETUP_PAGE_CULTIVOS: 14,
    SETUP_PAGE_RESUMEN: 15,
    SETUP_TOTAL_PAGES: 16,
    getCaminoCultivo: function (cfg) {
      cfg = cfg || ctx.state.configTorre;
      return cfg.caminoCultivo || '';
    },
    getCaminoDef: function (cam) {
      if (cam === 'semilla_coco_drip') {
        return { id: cam, faseInicial: 'germinacion' };
      }
      return null;
    },
    hcSetupEnFaseSalaPreGerm: function () {
      return false;
    },
    hcCocoDripInstalacionCerrada: function (cfg) {
      cfg = cfg || ctx.state.configTorre;
      return (
        cfg.tipoInstalacion === 'coco_drip' && cfg.checklistInstalacionConfirmada === true
      );
    },
    hcResolverCaminoSetup: function () {
      return ctx.state.configTorre.caminoCultivo;
    },
    ...extraCtx,
  });
  vm.runInContext(readFileSync(join(root, 'js/hc-camino-coco-drip.js'), 'utf8'), ctx);
  vm.runInContext(readFileSync(join(root, 'js/hc-camino-cultivo.js'), 'utf8'), ctx);
  vm.runInContext(readFileSync(join(root, 'js/hc-setup-flow.js'), 'utf8'), ctx);
  Object.assign(ctx, ctx.window);
  return ctx;
}

test('setup: hcSetupEnFaseGerminacion persiste tras cerrar wizard (coco)', () => {
  const ctx = loadCaminoStack();
  ctx.setupEsNuevaTorre = false;
  ctx.setupPagina = 0;
  assert.strictEqual(ctx.hcSetupEnFaseGerminacion(), true);
  ctx.state.configTorre.hcSetupFase = 'hidro';
  assert.strictEqual(ctx.hcSetupEnFaseGerminacion(), false);
});

test('setup: skips germ coco omiten PREMIUM_END y GEOMETRY', () => {
  const ctx = loadCaminoStack();
  const skip = ctx.getSetupSkippedPagesForCamino();
  assert.ok(skip.has(8));
  assert.ok(skip.has(9));
  assert.ok(!skip.has(7));
});

test('setup: hidro post-germ coco solo GEOMETRY visible', () => {
  const ctx = loadCaminoStack();
  ctx.state.configTorre.hcSetupFase = 'hidro';
  ctx.setupEsNuevaTorre = false;
  const skip = ctx.getSetupSkippedPagesForCamino();
  assert.ok(skip.has(8));
  assert.ok(!skip.has(9));
  assert.ok(skip.has(10));
  assert.ok(skip.has(15));
  const ultimo = ctx.getSetupUltimoPasoIndice();
  assert.strictEqual(ultimo, 9);
});

test('setup: hidroInstalacionCerrada usa hcCocoDripInstalacionCerrada', () => {
  const ctx = loadCaminoStack();
  assert.strictEqual(ctx.hidroInstalacionCerrada(ctx.state.configTorre), false);
  ctx.state.configTorre.tipoInstalacion = 'coco_drip';
  ctx.state.configTorre.checklistInstalacionConfirmada = true;
  assert.strictEqual(ctx.hidroInstalacionCerrada(ctx.state.configTorre), true);
});

test('setup: estático hcSetupIrAPaginaWizard y render sin snap ORIGEN', () => {
  const pages = readFileSync(join(root, 'js/hc-setup-wizard-pages.js'), 'utf8');
  assert.match(pages, /function hcSetupIrAPaginaWizard/);
  assert.doesNotMatch(pages, /setupPagina = SETUP_PAGE_ORIGEN[\s\S]{0,80}getSetupSkippedPages\(\)\.has\(setupPagina\)/);
});

test('setup: plan semillas coco en paso 6 (no host oculto)', () => {
  const germ = readFileSync(join(root, 'js/hc-premium-germ-plan.js'), 'utf8');
  assert.match(germ, /hcGermPlanEnPasoDetalleCocoDrip/);
  assert.match(germ, /semilla_coco_drip/);
  const wiz = readFileSync(join(root, 'js/hc-premium-wizard.js'), 'utf8');
  assert.match(wiz, /enGermCoco/);
  assert.match(wiz, /semilla_coco_drip.*validarPremiumGermPlan/s);
});
