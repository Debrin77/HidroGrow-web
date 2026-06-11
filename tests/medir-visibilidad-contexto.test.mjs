/**
 * Medir: visibilidad contextual según primer llenado, germ y sala.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('medir: gate depósito operativo y visibilidad contextual', () => {
  const germ = read('js/hc-medir-germinacion.js');
  const toast = read('js/app-hc-medicion-toast.js');
  const op = read('js/hc-medir-operativa.js');
  assert.match(germ, /hcMedirDepositoOperativoActivo/);
  assert.match(germ, /depositoPrimerLlenadoOk/);
  assert.match(germ, /refreshMedirVisibilidadContextual/);
  assert.match(germ, /hcMedirContextoBanner/);
  assert.match(germ, /buildMedirContextoHtml/);
  assert.match(germ, /hcMedirPermiteRegistroContextual/);
  assert.match(toast, /hcMedirPermiteRegistroContextual/);
  assert.doesNotMatch(op, /medir-flow--pre-operativa',\s*bloquearFlow/);
});

test('medir: germ pre-traslado mantiene tarjetas de propagador/cubo', () => {
  const germ = read('js/hc-medir-germinacion.js');
  assert.match(germ, /hcMedirModoGerminacionPropagador/);
  assert.match(germ, /hcMedirModoGerminacionCubo/);
  assert.match(germ, /Depósito DWC\/RDWC solo tras traslado/);
});
