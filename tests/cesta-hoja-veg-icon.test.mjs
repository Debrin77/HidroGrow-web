/**
 * Iconos de fase en cestas — hoja veg/maduración y gancho floración.
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

test('cesta: helpers hoja, maduración y floración pendiente', () => {
  const icons = read('js/hc-icon-registry.js');
  assert.match(icons, /HC_CESTA_HOJA_VEG_SRC = 'icons\/cesta-hoja-veg\.png'/);
  assert.match(icons, /HC_CESTA_FLORACION_SRC = 'icons\/cesta-floracion\.png'/);
  assert.match(icons, /HC_CESTA_FLORACION_LISTO = false/);
  assert.match(icons, /function hcCestaFaseIconoKey/);
  assert.match(icons, /function hcCestaFasePngSvgMarkup/);
  assert.match(icons, /function hcHojaCannabisImgHtml/);
  assert.match(icons, /diasVeg/);
  assert.match(icons, /est === 'madurez'/);
  assert.match(icons, /return 'floracion'/);
});

test('inicio: saludo usa PNG hoja cannabis', () => {
  const dash = read('js/meteo-forecast-dashboard.js');
  assert.match(dash, /hcHojaCannabisImgHtml/);
  assert.match(dash, /hc-greeting-leaf-img/);
});

test('cesta: renderizadores resuelven iconKey de fase', () => {
  const torre = read('js/torre-render-build.js');
  const dwc = read('js/diagrams/dwc/dwc-diagram.js');
  const rdwc = read('js/diagrams/rdwc/rdwc-diagram.js');
  const mc = read('js/diagrams/dwc/dwc-mc-plan-diagram.js');
  const illo = read('js/hc-diagram-illo.js');
  for (const src of [torre, dwc, rdwc, mc, illo]) {
    assert.match(src, /hcCestaFaseIconoKey/);
    assert.match(src, /hcCestaFasePngSvgMarkup/);
    assert.match(src, /hcCestaIconoFaseTexto/);
  }
});
