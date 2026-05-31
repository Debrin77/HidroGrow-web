import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(__dirname, '..', 'js', 'state-torre-logic.js'), 'utf8');
const ctx = vm.createContext({ console });
vm.runInContext(code, ctx);
const normalizeTorreModoActual = ctx.normalizeTorreModoActual;

test('normalizeTorreModoActual: modos HidroGrow válidos', () => {
  assert.strictEqual(normalizeTorreModoActual('vegetativo'), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual('floracion'), 'floracion');
  assert.strictEqual(normalizeTorreModoActual('esquejes'), 'esquejes');
  assert.strictEqual(normalizeTorreModoActual('intensivo'), 'intensivo');
});

test('normalizeTorreModoActual: alias hortícola → vegetativo', () => {
  assert.strictEqual(normalizeTorreModoActual('lechuga'), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual('lechugas'), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual('mixto'), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual('mini'), 'vegetativo');
});

test('normalizeTorreModoActual: basura cae a vegetativo', () => {
  assert.strictEqual(normalizeTorreModoActual(''), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual(null), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual('nope'), 'vegetativo');
  assert.strictEqual(normalizeTorreModoActual(undefined), 'vegetativo');
});
