/**
 * Icono hoja cannabis en cestas — fase vegetativa (crecimiento).
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

test('cesta: asset y helpers de hoja vegetativa', () => {
  const icons = read('js/hc-icon-registry.js');
  assert.match(icons, /HC_CESTA_HOJA_VEG_SRC = 'icons\/cesta-hoja-veg\.png'/);
  assert.match(icons, /function hcCestaEtapaUsaHojaVeg/);
  assert.match(icons, /function hcCestaHojaVegSvgMarkup/);
  assert.match(icons, /est === 'crecimiento'/);
  assert.match(icons, /function hcEstadoEmojiChar/);
});

test('cesta: renderizadores usan hoja en fase crecimiento', () => {
  const torre = read('js/torre-render-build.js');
  const dwc = read('js/diagrams/dwc/dwc-diagram.js');
  const rdwc = read('js/diagrams/rdwc/rdwc-diagram.js');
  const mc = read('js/diagrams/dwc/dwc-mc-plan-diagram.js');
  const illo = read('js/hc-diagram-illo.js');
  for (const src of [torre, dwc, rdwc, mc, illo]) {
    assert.match(src, /hcCestaHojaVegSvgMarkup/);
    assert.match(src, /hcCestaIconoFaseTexto/);
  }
});
