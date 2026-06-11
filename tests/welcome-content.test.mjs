/**
 * Bienvenida: copy alineado con caminos, checklists y mejoras recientes.
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

test('bienvenida: mensaje app completa y pasos a rajatabla', () => {
  const html = read('index.html');
  assert.match(html, /Muy completa · muy útil · sencilla si sigues los pasos/);
  assert.match(html, /app muy completa/);
  assert.match(html, /a rajatabla/);
  assert.match(html, /class="welcome-promise"/);
});

test('bienvenida: cuatro caminos y primer llenado EC', () => {
  const html = read('index.html');
  assert.match(html, /Cuatro formas de empezar/);
  assert.match(html, /Semilla en propagador/);
  assert.match(html, /Semilla en el hidro/);
  assert.match(html, /Esqueje \/ clon/);
  assert.match(html, /Madre en DWC\/RDWC/);
  assert.match(html, /primer llenado/);
  assert.match(html, /CalMag, abono y EC meta/);
});

test('bienvenida: tarjetas sin placeholders rotos y con Sistema', () => {
  const html = read('index.html');
  const welcome = html.match(/id="welcomeOverlay"[\s\S]*?<!-- -- ASISTENTE DE CONFIGURACIÓN --/);
  assert.ok(welcome && welcome[0], 'bloque welcomeOverlay');
  const w = welcome[0];
  assert.match(w, /Primer llenado guiado/);
  assert.match(w, /Germinación sin ruido/);
  assert.match(w, /Cultivo e instalación/);
  assert.doesNotMatch(w, /bandas téricas/);
  assert.doesNotMatch(w, /🌿\?/);
  assert.doesNotMatch(w, /\? Desliza \?/);
});

test('bienvenida: estilos promise en main.css', () => {
  const css = read('css/main.css');
  assert.match(css, /\.welcome-promise/);
  assert.match(css, /#welcomeOverlay\[data-welcome-theme="dark"\] \.welcome-promise/);
});
