import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert';
import vm from 'node:vm';

test('hc-equipamiento-wizard exports renderEquipamientoPremiumUI', () => {
  const sandbox = { window: {}, document: { getElementById: () => null }, console };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('../js/hc-equipamiento-catalog.js', import.meta.url), 'utf8'), ctx);
  vm.runInContext(readFileSync(new URL('../js/hc-equipamiento-wizard.js', import.meta.url), 'utf8'), ctx);
  assert.strictEqual(typeof sandbox.renderEquipamientoPremiumUI, 'function');
  assert.strictEqual(typeof sandbox.seleccionarEquipamientoPremium, 'function');
  assert.strictEqual(typeof sandbox.getCamposEquipamientoFaltantes, 'function');
});
