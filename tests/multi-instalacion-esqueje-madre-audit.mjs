/**
 * Playwright: dos instalaciones independientes (esqueje_hidro + madre_hidro).
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

function auditEsquejeMadreMulti() {
  function makeCfgEsqueje(nombre, opts) {
    opts = opts || {};
    return {
      caminoCultivo: 'esqueje_hidro',
      tipoInstalacion: 'dwc',
      origenPlanta: 'esqueje',
      checklistInstalacionConfirmada: opts.hidroCerrado === true,
      salaPreGermConfigAt: new Date().toISOString(),
      puestaMarchaChecks: { completedAt: new Date().toISOString() },
      hcPropagadorGermAsistenteGuardadoAt: new Date().toISOString(),
      enraizadoMontajeChecks: opts.enraizadoOk
        ? { completedAt: new Date().toISOString() }
        : undefined,
      premiumSetup: {
        caminoCultivo: 'esqueje_hidro',
        origenPlanta: 'esqueje',
        numEsquejes: 6,
        sustratoGerm: 'lana',
      },
      esquejesProtocolo: {
        prepMadre: {},
        corte: {},
        enraizar: {},
        domoDias: {},
        mantener: {},
        ultimaSesionEsquejes: '',
        intervaloSesionDias: 12,
      },
      operativa: true,
      nombre: nombre,
    };
  }

  function makeCfgMadre(nombre, opts) {
    opts = opts || {};
    return {
      caminoCultivo: 'madre_hidro',
      tipoInstalacion: 'dwc',
      origenPlanta: 'madre',
      checklistInstalacionConfirmada: opts.hidroCerrado === true,
      salaPreGermConfigAt: new Date().toISOString(),
      puestaMarchaChecks: { completedAt: new Date().toISOString() },
      hcPropagadorGermAsistenteGuardadoAt: new Date().toISOString(),
      premiumSetup: {
        caminoCultivo: 'madre_hidro',
        origenPlanta: 'madre',
      },
      esquejesProtocolo: {
        prepMadre: {},
        corte: {},
        enraizar: {},
        domoDias: {},
        mantener: {},
        fechaInicioMadre: new Date().toLocaleDateString('es-ES'),
        intervaloSesionDias: 12,
      },
      operativa: true,
      nombre: nombre,
    };
  }

  const cfgEsqueje = makeCfgEsqueje('Clones hidro', { hidroCerrado: false });
  const cfgMadre = makeCfgMadre('Madre casa', { hidroCerrado: false });

  state.torres = [
    {
      id: 2001,
      nombre: 'Clones hidro',
      emoji: '🌿',
      config: cfgEsqueje,
      torre: [],
      modoActual: 'vegetativo',
      mediciones: [],
      registro: [],
    },
    {
      id: 2002,
      nombre: 'Madre casa',
      emoji: '👑',
      config: cfgMadre,
      torre: [],
      modoActual: 'vegetativo',
      mediciones: [],
      registro: [],
    },
  ];
  state.torreActiva = 0;
  state.configTorre = JSON.parse(JSON.stringify(cfgEsqueje));
  state.torre = [];

  if (typeof initTorres === 'function') initTorres();

  const esquejeSnap = {
    camino: typeof getCaminoCultivo === 'function' ? getCaminoCultivo(state.configTorre) : '',
    fase: typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(state.configTorre) : '',
    paso:
      typeof hcSiguientePasoEsquejeHidro === 'function'
        ? hcSiguientePasoEsquejeHidro(state.configTorre)
        : null,
    hub:
      typeof hcEsquejeEnraizadoHubEsPrincipal === 'function' &&
      hcEsquejeEnraizadoHubEsPrincipal(state.configTorre),
    domoSvg:
      typeof hcSistemaEsquejeMuestraEsquemaDomo === 'function' &&
      hcSistemaEsquejeMuestraEsquemaDomo(state.configTorre),
  };

  if (typeof cambiarTorreActiva === 'function') cambiarTorreActiva(1);

  const madreSnap = {
    camino: typeof getCaminoCultivo === 'function' ? getCaminoCultivo(state.configTorre) : '',
    fase: typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(state.configTorre) : '',
    paso:
      typeof hcSiguientePasoMadreHidro === 'function'
        ? hcSiguientePasoMadreHidro(state.configTorre)
        : null,
    hub:
      typeof hcMadreHubEsPrincipal === 'function' && hcMadreHubEsPrincipal(state.configTorre),
    dwcSvg:
      typeof hcSistemaMadreMuestraEsquemaDwc === 'function' &&
      hcSistemaMadreMuestraEsquemaDwc(state.configTorre),
    count: state.torres.length,
  };

  const cfgEsquejeOper = makeCfgEsqueje('Clones hidro', { hidroCerrado: true, enraizadoOk: false });
  if (typeof hcEquipSalaMontajeFingerprint === 'function') {
    cfgEsquejeOper.puestaMarchaChecks = {
      completedAt: new Date().toISOString(),
      hcPmEquipFpAtVerify: hcEquipSalaMontajeFingerprint(cfgEsquejeOper),
    };
  }
  state.torres[0].config = JSON.parse(JSON.stringify(cfgEsquejeOper));
  if (typeof cambiarTorreActiva === 'function') cambiarTorreActiva(0);

  const esquejeOper = {
    fase: typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(state.configTorre) : '',
    hub:
      typeof hcEsquejeEnraizadoHubEsPrincipal === 'function' &&
      hcEsquejeEnraizadoHubEsPrincipal(state.configTorre),
    domoSvg:
      typeof hcSistemaEsquejeMuestraEsquemaDomo === 'function' &&
      hcSistemaEsquejeMuestraEsquemaDomo(state.configTorre),
    pasoAction:
      typeof hcSiguientePasoEsquejeHidro === 'function'
        ? (hcSiguientePasoEsquejeHidro(state.configTorre) || {}).action
        : '',
  };

  return { esquejeSnap, madreSnap, esquejeOper };
}

test('multi-instalacion: esqueje y madre coexisten sin mezclar caminos', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await unlockPin(page);
  const snap = await page.evaluate(auditEsquejeMadreMulti);

  assert.equal(snap.madreSnap.count, 2);
  assert.equal(snap.esquejeSnap.camino, 'esqueje_hidro');
  assert.equal(snap.madreSnap.camino, 'madre_hidro');
  assert.equal(snap.esquejeSnap.fase, null, 'sin hidro cerrado: sin fase enraizado aún');
  assert.ok(snap.esquejeSnap.paso && snap.esquejeSnap.paso.action, 'esqueje tiene siguiente paso guiado');
  assert.ok(snap.madreSnap.paso && snap.madreSnap.paso.action, 'madre tiene siguiente paso');
  assert.equal(snap.esquejeSnap.hub, false);
  assert.equal(snap.madreSnap.hub, false);
  assert.equal(snap.esquejeSnap.domoSvg, false);
  assert.equal(snap.madreSnap.dwcSvg, false);

  assert.equal(snap.esquejeOper.fase, 'enraizado', 'con hidro cerrado: fase enraizado activa');
  assert.equal(snap.esquejeOper.hub, true);
  assert.equal(snap.esquejeOper.domoSvg, true);
  assert.equal(snap.esquejeOper.pasoAction, 'irPropagadorMontaje');

  await browser.close();
});
