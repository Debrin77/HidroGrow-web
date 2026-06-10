/**
 * Playwright: dos instalaciones independientes (semilla_hidro + semilla_propagador).
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
    await page.waitForTimeout(100);
  }
  await page.waitForFunction(
    () => typeof appBootstrapped !== 'undefined' && appBootstrapped === true,
    { timeout: 90000 }
  );
}

function auditMultiInstall() {
  function makeCfgHidro(nombre) {
    return {
      caminoCultivo: 'semilla_hidro',
      tipoInstalacion: 'dwc',
      origenPlanta: 'semilla',
      checklistInstalacionConfirmada: true,
      preparacionGermHidroChecks: { completedAt: new Date().toISOString() },
      salaPreGermConfigAt: new Date().toISOString(),
      puestaMarchaChecks: { completedAt: new Date().toISOString() },
      hcPropagadorGermAsistenteGuardadoAt: new Date().toISOString(),
      premiumSetup: {
        caminoCultivo: 'semilla_hidro',
        origenPlanta: 'semilla',
        variedadGerminacion: 'northern_lights',
        numSemillasGerm: 2,
        sustratoGerm: 'rockwool',
      },
      germinacionFlow: {
        numSemillas: 2,
        variedadId: 'northern_lights',
        pasos: {},
        registroDiario: [],
        fechaInicio: new Date().toISOString().slice(0, 10),
        activo: true,
      },
      operativa: true,
      nombre: nombre,
    };
  }

  function makeCfgPropagador(nombre) {
    return {
      caminoCultivo: 'semilla_propagador',
      tipoInstalacion: 'dwc',
      origenPlanta: 'semilla',
      checklistInstalacionConfirmada: true,
      propagadorMontajeChecks: { completedAt: new Date().toISOString() },
      hcPropagadorGermAsistenteGuardadoAt: new Date().toISOString(),
      premiumSetup: {
        caminoCultivo: 'semilla_propagador',
        variedadGerminacion: 'northern_lights',
        numSemillasGerm: 3,
        sustratoGerm: 'rockwool',
      },
      germinacionFlow: {
        numSemillas: 3,
        variedadId: 'northern_lights',
        pasos: {},
        registroDiario: [],
        fechaInicio: new Date().toISOString().slice(0, 10),
        activo: true,
      },
      operativa: true,
      nombre: nombre,
    };
  }

  const cfgHidro = makeCfgHidro('Mi cultivo hidro');
  const cfgProp = makeCfgPropagador('Mi propagador casa');

  state.torres = [
    {
      id: 1001,
      nombre: 'Mi cultivo hidro',
      emoji: '🫧',
      config: cfgHidro,
      torre: [],
      modoActual: 'vegetativo',
      mediciones: [],
      registro: [],
    },
    {
      id: 1002,
      nombre: 'Mi propagador casa',
      emoji: '🫧',
      config: cfgProp,
      torre: [],
      modoActual: 'vegetativo',
      mediciones: [],
      registro: [],
    },
  ];
  state.torreActiva = 0;
  state.configTorre = JSON.parse(JSON.stringify(cfgHidro));
  state.torre = [];

  if (typeof initTorres === 'function') initTorres();

  const trasInit = {
    count: state.torres.length,
    nombres: state.torres.map((t) => t.nombre),
    hidroReal:
      typeof hidrogrowTorreSlotEsReal === 'function' &&
      hidrogrowTorreSlotEsReal(state.torres[0]),
    propReal:
      typeof hidrogrowTorreSlotEsReal === 'function' &&
      hidrogrowTorreSlotEsReal(state.torres[1]),
    hcHidroReal:
      typeof hcSlotInstalacionEsReal === 'function' && hcSlotInstalacionEsReal(state.torres[0]),
    hcPropReal:
      typeof hcSlotInstalacionEsReal === 'function' && hcSlotInstalacionEsReal(state.torres[1]),
  };

  if (typeof cambiarTorreActiva === 'function') cambiarTorreActiva(1);

  const enPropagador = {
    activa: state.torreActiva,
    camino:
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(state.configTorre) : '',
    nombre: state.torres[state.torreActiva].nombre,
  };

  if (typeof cambiarTorreActiva === 'function') cambiarTorreActiva(0);

  const enHidro = {
    activa: state.torreActiva,
    camino:
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(state.configTorre) : '',
    nombre: state.torres[state.torreActiva].nombre,
  };

  cfgProp.germinacionFlow.trasladoAt = new Date().toISOString();
  cfgProp.germinacionFlow.activo = false;
  state.torres[1].config = JSON.parse(JSON.stringify(cfgProp));
  if (typeof cambiarTorreActiva === 'function') cambiarTorreActiva(1);

  const postTraslado = {
    fase: typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(state.configTorre) : '',
    sinHidro:
      typeof hcSistemaPropagadorSinHidro === 'function' &&
      hcSistemaPropagadorSinHidro(state.configTorre),
    medirPost:
      typeof hcMedirPermiteRegistroPostTrasladoPropagador === 'function' &&
      hcMedirPermiteRegistroPostTrasladoPropagador(state.configTorre),
    propagadorMontaje:
      typeof propagadorMontajeCompleto === 'function' &&
      propagadorMontajeCompleto(state.configTorre),
  };

  return { trasInit, enPropagador, enHidro, postTraslado };
}

test('primera instalacion propagador: initTorres no crea ranura duplicada en asistente', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const count = await page.evaluate(function () {
    setupEsNuevaTorre = true;
    state.configTorre = {
      caminoCultivo: 'semilla_propagador',
      tipoInstalacion: 'dwc',
      origenPlanta: 'semilla',
      germinacionFlow: {
        numSemillas: 2,
        variedadId: 'northern_lights',
        pasos: {},
        registroDiario: [],
        fechaInicio: new Date().toISOString().slice(0, 10),
        activo: true,
      },
      premiumSetup: {
        caminoCultivo: 'semilla_propagador',
        variedadGerminacion: 'northern_lights',
        numSemillasGerm: 2,
      },
    };
    state.torres = [];
    if (typeof initTorres === 'function') initTorres();
    return state.torres.length;
  });
  assert.equal(count, 0, 'sin ranura migrada durante setupEsNuevaTorre');
  await browser.close();
});

test('multi-instalacion: hidro y propagador coexisten y cambian de ranura', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditMultiInstall);

  assert.equal(snap.trasInit.count, 2, 'dos ranuras tras initTorres');
  assert.equal(snap.trasInit.hidroReal, true, 'hidro es instalación real (bootstrap)');
  assert.equal(snap.trasInit.propReal, true, 'propagador es instalación real (bootstrap)');
  assert.equal(snap.trasInit.hcHidroReal, true, 'hidro es instalación real (runtime)');
  assert.equal(snap.trasInit.hcPropReal, true, 'propagador es instalación real (runtime)');
  assert.ok(snap.trasInit.nombres.includes('Mi cultivo hidro'));
  assert.ok(snap.trasInit.nombres.includes('Mi propagador casa'));

  assert.equal(snap.enPropagador.activa, 1);
  assert.equal(snap.enPropagador.camino, 'semilla_propagador');
  assert.equal(snap.enPropagador.nombre, 'Mi propagador casa');

  assert.equal(snap.enHidro.activa, 0);
  assert.equal(snap.enHidro.camino, 'semilla_hidro');
  assert.equal(snap.enHidro.nombre, 'Mi cultivo hidro');

  assert.equal(snap.postTraslado.fase, null, 'post-traslado: sin fase propagador');
  assert.equal(snap.postTraslado.sinHidro, false, 'post-traslado: modo hidro en Sistema/Inicio');
  assert.equal(snap.postTraslado.medirPost, true, 'Medir permite guardar post-traslado');
  assert.equal(snap.postTraslado.propagadorMontaje, true, 'montaje domo por completedAt');

  await browser.close();
});
