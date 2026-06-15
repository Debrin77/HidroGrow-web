/**
 * Programación coco DTW en tiempo real (genética + microfase).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadCocoStack(extraCtx = {}) {
  const ctx = vm.createContext({
    console,
    window: {},
    globalThis: {},
    state: {
      configTorre: {
        tipoInstalacion: 'coco_drip',
        caminoCultivo: 'semilla_coco_drip',
        cocoDripTamanoMacetas: 'medium',
        cocoDripNumPlantas: 4,
        cocoDripEmitterFlowLph: 2,
        horasLuz: 18,
      },
      torre: [[{ variedad: 'amnesia_haze', fecha: new Date(Date.now() - 50 * 86400000).toISOString() }]],
    },
    Math,
    Number,
    JSON,
    parseInt,
    String,
    Array,
    Object,
    Date,
    isNaN,
    cultivoFaseDesdeDias: null,
    ...extraCtx,
  });
  vm.runInContext(readFileSync(join(root, 'js/genetics-db.js'), 'utf8'), ctx);
  vm.runInContext(
    "function getCultivoDB(id){ var db=(typeof CULTIVOS_DB!=='undefined'?CULTIVOS_DB:GENETICS_DB); return db.find(function(c){return c.id===id;}); }",
    ctx
  );
  vm.runInContext(readFileSync(join(root, 'js/hc-camino-coco-drip.js'), 'utf8'), ctx);
  vm.runInContext(readFileSync(join(root, 'js/hc-coco-drip-scheduler.js'), 'utf8'), ctx);
  Object.assign(ctx, ctx.window);
  return ctx;
}

test('scheduler: boot y exports', () => {
  const src = readFileSync(join(root, 'js/hc-coco-drip-scheduler.js'), 'utf8');
  assert.match(src, /buildCocoDripProgramacionTiempoReal/);
  assert.match(src, /COCO_DRIP_GRUPO_FACTORS/);
  assert.match(readFileSync(join(root, 'js/hc-boot-manifest.js'), 'utf8'), /hc-coco-drip-scheduler\.js/);
});

test('scheduler: sativa en flor más eventos que CBD en plántula', () => {
  const ctx = loadCocoStack();
  const sativa = ctx.buildCocoDripProgramacionTiempoReal();
  assert.ok(sativa);
  assert.match(sativa.microfase, /flor/);
  assert.ok(sativa.eventosDia >= 4);

  ctx.state.torre = [[{ variedad: 'charlottes_web', fecha: new Date().toISOString() }]];
  const cbd = ctx.buildCocoDripProgramacionTiempoReal();
  assert.ok(cbd);
  assert.ok(cbd.eventosDia < sativa.eventosDia);
  assert.strictEqual(cbd.grupoGenetica, 'cbd');
});

test('scheduler: auto Northern Lights cap eventos ≤5', () => {
  const ctx = loadCocoStack();
  ctx.state.torre = [
    [{ variedad: 'northern_lights_auto', fecha: new Date(Date.now() - 45 * 86400000).toISOString() }],
  ];
  const prog = ctx.buildCocoDripProgramacionTiempoReal();
  assert.ok(prog);
  assert.strictEqual(prog.grupoGenetica, 'auto');
  assert.ok(prog.eventosDia <= 5);
});

test('scheduler: multi-genética por maceta', () => {
  const ctx = loadCocoStack();
  ctx.state.torre = [
    [
      { variedad: 'og_kush', fecha: new Date(Date.now() - 40 * 86400000).toISOString() },
      { variedad: 'amnesia_haze', fecha: new Date(Date.now() - 55 * 86400000).toISOString() },
    ],
  ];
  const prog = ctx.buildCocoDripProgramacionTiempoReal();
  assert.ok(prog);
  assert.strictEqual(prog.multiGenetica, true);
  assert.ok(prog.celdasResumen && prog.celdasResumen.length === 2);
  assert.ok(prog.porCelda && prog.porCelda['0_0'] && prog.porCelda['0_1']);
  assert.ok(prog.eventosDia >= prog.porCelda['0_0'].eventosDia);
});

test('scheduler: ajuste runoff EC alto reduce pulso', () => {
  const ctx = loadCocoStack();
  ctx.state.configTorre.cocoDripRunoffPorCelda = {
    '0_0': { ecEntrada: 1400, ecRunoff: 2200, runoffPct: 15, fecha: new Date().toISOString() },
  };
  const adj = ctx.ajustePorRunoffCocoDrip(ctx.state.configTorre, '0_0');
  assert.ok(adj.eventDelta <= 0 || adj.volMult < 1);
  assert.ok(adj.nota.length > 0);
});

test('scheduler: registrar runoff desde medir', () => {
  const ctx = loadCocoStack();
  var entry = ctx.registrarCocoDripRunoffDesdeMedir(ctx.state.configTorre, {
    cocoDripCeldaKey: '0_0',
    ecEntrada: 1300,
    ecRunoff: 1100,
    runoffPct: 8,
  });
  assert.ok(entry);
  assert.strictEqual(ctx.state.configTorre.cocoDripRunoffPorCelda['0_0'].ecRunoff, 1100);
});

test('scheduler: próximo evento en ventana 24 h', () => {
  const ctx = loadCocoStack();
  const prog = ctx.buildCocoDripProgramacionTiempoReal();
  const prox = ctx.resolveProximoEventoCoco(prog);
  assert.ok(prox);
  assert.ok(prox.enMinutos >= 0 && prox.enMinutos <= 24 * 60);
  assert.match(prox.label, /^\d{2}:\d{2}$/);
});
