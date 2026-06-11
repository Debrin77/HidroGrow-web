/**
 * Arranque EC por camino: propagador post-traslado pre-llenado y esqueje operativo.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

/** Réplica mínima de hcCaminoUsaEcArranqueBaja (semilla_propagador + esqueje_hidro). */
function arranqueBajaMock(cfg, deps) {
  const cam = deps.getCaminoCultivo(cfg);
  const st = deps.state || {};

  if (cam === 'semilla_propagador') {
    if (deps.depositoPrimerLlenadoOk && !deps.depositoPrimerLlenadoOk(cfg, st)) return true;
    if (deps.germinacionConcluida && deps.germinacionConcluida(cfg)) return false;
    if (deps.hcGerminacionActiva && deps.hcGerminacionActiva(cfg)) return true;
    if (deps.getSistemaFaseCamino && deps.getSistemaFaseCamino(cfg) === 'propagador') return true;
    if (deps.hcPropagadorTrasladoCompletado && deps.hcPropagadorTrasladoCompletado(cfg)) return true;
    return true;
  }

  if (cam === 'esqueje_hidro') {
    if (deps.depositoPrimerLlenadoOk && !deps.depositoPrimerLlenadoOk(cfg, st)) return true;
    if (deps.getSistemaFaseCamino && deps.getSistemaFaseCamino(cfg) === 'enraizado') return true;
    if (deps.depositoPrimerLlenadoOk && deps.depositoPrimerLlenadoOk(cfg, st)) {
      const faseSis = deps.getSistemaFaseCamino ? deps.getSistemaFaseCamino(cfg) : null;
      if (faseSis !== 'enraizado') return false;
    }
    if (deps.getRecomendacionEcPhEsquejes) {
      const recE = deps.getRecomendacionEcPhEsquejes(cfg);
      if (
        recE &&
        recE.activo &&
        ['clonador_48h', 'enraizamiento', 'traslado_dwc'].indexOf(recE.fase) >= 0
      ) {
        return true;
      }
    }
    return false;
  }

  return false;
}

const baseDeps = {
  state: {},
  getCaminoCultivo: (cfg) => cfg.camino,
  depositoPrimerLlenadoOk: (cfg) => !!cfg.depositoOk,
  germinacionConcluida: (cfg) => !!cfg.germConcluida,
  hcGerminacionActiva: () => false,
  getSistemaFaseCamino: (cfg) => cfg.faseSistema || null,
  hcPropagadorTrasladoCompletado: (cfg) => !!cfg.trasladoOk,
  getRecomendacionEcPhEsquejes: (cfg) => cfg.recEsqueje || null,
};

test('estático: propagador evalúa primer llenado antes que germinacionConcluida', () => {
  const calc = read('js/hc-setup-calc-core.js');
  assert.match(
    calc,
    /cam === 'semilla_propagador'[\s\S]{0,220}depositoPrimerLlenadoOk[\s\S]{0,160}germinacionConcluida/
  );
});

test('estático: esqueje operativo no usa fallback domo tras primer llenado', () => {
  const calc = read('js/hc-setup-calc-core.js');
  assert.match(calc, /var faseSisEsqueje/);
  assert.match(calc, /faseSisEsqueje !== 'enraizado'\) return false/);
  assert.match(calc, /cam === 'esqueje_hidro'[\s\S]{0,1200}faseSisEsqueje/);
});

test('propagador: germ concluida + traslado + sin primer llenado → arranque ON', () => {
  const cfg = {
    camino: 'semilla_propagador',
    germConcluida: true,
    trasladoOk: true,
    depositoOk: false,
  };
  assert.equal(arranqueBajaMock(cfg, baseDeps), true);
});

test('propagador: germ concluida + primer llenado hecho → arranque OFF', () => {
  const cfg = {
    camino: 'semilla_propagador',
    germConcluida: true,
    trasladoOk: true,
    depositoOk: true,
  };
  assert.equal(arranqueBajaMock(cfg, baseDeps), false);
});

test('propagador: germ activa sin traslado → arranque ON', () => {
  const cfg = { camino: 'semilla_propagador', germConcluida: false, depositoOk: false };
  const deps = {
    ...baseDeps,
    hcGerminacionActiva: () => true,
  };
  assert.equal(arranqueBajaMock(cfg, deps), true);
});

test('esqueje: operativo post-llenado sin sesión → arranque OFF aunque fase domo', () => {
  const cfg = {
    camino: 'esqueje_hidro',
    depositoOk: true,
    faseSistema: null,
    recEsqueje: { activo: true, fase: 'enraizamiento' },
  };
  assert.equal(arranqueBajaMock(cfg, baseDeps), false);
});

test('esqueje: pre-llenado con fase enraizado → arranque ON', () => {
  const cfg = {
    camino: 'esqueje_hidro',
    depositoOk: false,
    faseSistema: 'enraizado',
    recEsqueje: { activo: true, fase: 'enraizamiento' },
  };
  assert.equal(arranqueBajaMock(cfg, baseDeps), true);
});

test('esqueje: pre-llenado sin sesión (fallback enraizamiento) → arranque ON', () => {
  const cfg = {
    camino: 'esqueje_hidro',
    depositoOk: false,
    faseSistema: null,
    recEsqueje: { activo: true, fase: 'enraizamiento' },
  };
  assert.equal(arranqueBajaMock(cfg, baseDeps), true);
});
