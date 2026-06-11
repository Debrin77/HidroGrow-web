/**
 * Modelo CalMag + abono: EC tras mezcla ≈ EC meta (PC·2) en arranque y veg.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const EC_CALMAG_BASE = 400;
const CALMAG_POR_ML = 30;
const EC_POR_ML_AB = 33;
const VOL_OBJETIVO = 18;

function getEcReservaAbonoArranqueMicroS(ecMeta) {
  const m = Number(ecMeta);
  if (!Number.isFinite(m) || m <= 0) return 80;
  return Math.max(50, Math.min(160, Math.round(m * 0.28)));
}

function getEcObjetivoTrasCalMagMicroS(ecMeta, ec0) {
  if (ecMeta > EC_CALMAG_BASE) return Math.max(ec0, EC_CALMAG_BASE);
  const reserva = getEcReservaAbonoArranqueMicroS(ecMeta);
  let objetivo = ecMeta - reserva;
  if (objetivo <= ec0) {
    objetivo = Math.max(ec0, ecMeta - Math.max(40, Math.round(reserva * 0.5)));
  }
  return Math.min(ecMeta - 40, Math.max(ec0, objetivo));
}

function estimarEcCalMagMicroS(mlCM, vol) {
  return Math.round(CALMAG_POR_ML * mlCM * (VOL_OBJETIVO / vol));
}

function mlCalMagParaEc(ecObj, ec0, vol) {
  const delta = Math.max(0, ecObj - ec0);
  if (delta <= 0) return 0;
  return Math.round((delta / CALMAG_POR_ML) * (vol / VOL_OBJETIVO) * 10) / 10;
}

function ecSubePorMlParAB(vol) {
  return EC_POR_ML_AB * (VOL_OBJETIVO / vol);
}

function ecTrasMezclaModelo(ecMeta, vol, ec0) {
  const ecObjCal = getEcObjetivoTrasCalMagMicroS(ecMeta, ec0);
  const mlCM = mlCalMagParaEc(ecObjCal, ec0, vol);
  const ecBase = ec0 + estimarEcCalMagMicroS(mlCM, vol);
  let pendiente = Math.max(0, ecMeta - ecBase);
  if (pendiente > 0 && pendiente < 12) pendiente = 12;
  const slope = ecSubePorMlParAB(vol);
  const mlAb = pendiente / slope;
  return Math.round(ecBase + mlAb * slope);
}

test('arranque 400 µS: tras CalMag < meta y mezcla final ≈ meta', () => {
  const meta = 400;
  const vol = 18;
  const ec0 = 0;
  const ecObjCal = getEcObjetivoTrasCalMagMicroS(meta, ec0);
  assert.ok(ecObjCal < meta, 'CalMag no debe consumir toda la EC meta');
  const ecFinal = ecTrasMezclaModelo(meta, vol, ec0);
  assert.ok(Math.abs(ecFinal - meta) <= 2, `esperado ~${meta}, modelo ${ecFinal}`);
});

test('veg 1400 µS: CalMag ~400 y mezcla final ≈ meta', () => {
  const meta = 1400;
  const vol = 18;
  const ec0 = 0;
  const ecObjCal = getEcObjetivoTrasCalMagMicroS(meta, ec0);
  assert.equal(ecObjCal, EC_CALMAG_BASE);
  const ecFinal = ecTrasMezclaModelo(meta, vol, ec0);
  assert.ok(Math.abs(ecFinal - meta) <= 2, `esperado ~${meta}, modelo ${ecFinal}`);
});

test('DWC multicubo 5 L: mismo volumen en CalMag y abono', () => {
  const meta = 400;
  const vol = 5;
  const ecFinal = ecTrasMezclaModelo(meta, vol, 0);
  assert.ok(Math.abs(ecFinal - meta) <= 3, `5 L: esperado ~${meta}, modelo ${ecFinal}`);
});
