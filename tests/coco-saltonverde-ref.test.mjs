/**
 * Referencia Saltón Verde — tabla EC/pH y reglas DTW.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadSaltonVerdeRef() {
  const ctx = vm.createContext({ window: {}, globalThis: {} });
  vm.runInContext(readFileSync(join(root, 'js/hc-coco-saltonverde-ref.js'), 'utf8'), ctx);
  Object.assign(ctx, ctx.window);
  return ctx;
}

test('saltonverde: constantes y runoff/dryback', () => {
  const w = loadSaltonVerdeRef();
  assert.equal(w.COCO_SV_FUENTE_URL, 'https://saltonverde.com/guia-de-cultivo-en-coco/');
  assert.equal(w.COCO_SV_RUNOFF_PCT.min, 10);
  assert.equal(w.COCO_SV_RUNOFF_PCT.max, 20);
  assert.equal(w.COCO_SV_DRYBACK_RIEGO_PCT.min, 30);
  assert.equal(w.COCO_SV_DRYBACK_RIEGO_PCT.max, 40);
  assert.equal(w.COCO_SV_DENSIDAD.plantasPorM2, 9);
  assert.equal(w.COCO_SV_MACETA_LITROS.medium, 5);
});

test('saltonverde: EC/pH por microfase', () => {
  const w = loadSaltonVerdeRef();
  const enraizado = w.getEcPhSaltonVerde('esqueje');
  assert.equal(enraizado.ec.ecMinMs, 0.4);
  assert.equal(enraizado.ec.ecMaxMs, 0.6);
  assert.equal(enraizado.ph.min, 5.5);

  const flor = w.getEcPhSaltonVerde('flor_pico');
  assert.equal(flor.ec.ecMinMs, 1.8);
  assert.equal(flor.ec.ecMaxMs, 2.2);

  const flush = w.getEcPhSaltonVerde('flush');
  assert.equal(flush.ec.ecMaxMs, 0.4);
  assert.match(flush.nota || '', /no agua pura/i);
});

test('saltonverde: tabla HTML y diagrama 3×3', () => {
  const w = loadSaltonVerdeRef();
  const html = w.renderSaltonVerdeEcTableHtml();
  assert.match(html, /Floración media/);
  assert.match(html, /saltonverde\.com/);

  const fases = w.renderCocoDripFasesInicialesHtml();
  assert.match(fases, /propagador/i);
  assert.match(fases, /0,3–1 L/);

  const diag = readFileSync(join(root, 'js/diagrams/coco-drip/coco-drip-diagram.js'), 'utf8');
  assert.match(diag, /nPlant === 9/);
  assert.match(diag, /no reabsorber runoff/i);
});

test('coco drip: germinación en propagador (modo fijo)', () => {
  const germ = readFileSync(join(root, 'js/hc-germinacion-flow.js'), 'utf8');
  assert.match(germ, /semilla_coco_drip.*propagador/s);
  assert.match(germ, /CHECKLIST_TRASLADO_COCO_DTW/);
  const camino = readFileSync(join(root, 'js/hc-camino-cultivo.js'), 'utf8');
  assert.match(camino, /hcSiguientePasoSemillaCocoDripPostGerm/);
  assert.match(readFileSync(join(root, 'js/hc-bootstrap-config.js'), 'utf8'), /hidrogrowSemillaCocoDripEnFaseGermSinDtw/);
});
