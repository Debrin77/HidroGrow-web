/**
 * Smoke completo: PIN + initApp + errores JS en carga.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = 'file:///' + root.replace(/\\/g, '/') + '/index.html';

test('carga index: sin errores IIFE global undefined', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(indexUrl, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(4000);

  const globalUndefined = pageErrors.filter((m) =>
    /Cannot set properties of undefined|is not defined|Unexpected token|SyntaxError/.test(m)
  );

  for (const d of '2506') {
    await page.locator('.pin-key[data-digit="' + d + '"]').click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(8000);

  const snap = await page.evaluate(() => ({
    initApp: typeof initApp,
    appBootstrapped: typeof appBootstrapped !== 'undefined' ? appBootstrapped : null,
    pinErr: document.getElementById('pinErr')?.textContent || '',
    appVisible: document.getElementById('app')?.style.display !== 'none',
    appBooting: document.getElementById('app')?.classList.contains('hc-app-booting'),
    toast: document.querySelector('.toast')?.textContent || '',
    pinDisplay: document.getElementById('pinScreen')?.style.display,
  }));

  if (globalUndefined.length) {
    console.error('PAGE ERRORS:', globalUndefined.join('\n'));
  }
  if (pageErrors.length && !globalUndefined.length) {
    console.error('OTHER ERRORS:', pageErrors.slice(0, 8).join('\n'));
  }

  assert.equal(globalUndefined.length, 0, globalUndefined.join('; '));
  assert.equal(snap.initApp, 'function');
  assert.equal(snap.appBootstrapped, true, 'pinErr=' + snap.pinErr + ' toast=' + snap.toast);
  assert.equal(snap.pinDisplay, 'none');

  await browser.close();
});

test('IIFE con param global deben pasar window', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/src="js\/([^"]+\.js)[^"]*"/g)].map((m) => m[1]);
  const bad = [];
  for (const rel of scripts) {
    let src;
    try {
      src = readFileSync(join(root, 'js', rel.replace(/^js\//, '')), 'utf8');
    } catch {
      try {
        src = readFileSync(join(root, rel), 'utf8');
      } catch {
        continue;
      }
    }
    if (!/\(function\s*\(\s*global\s*\)/.test(src)) continue;
    if (/\}\)\(\s*typeof\s+window/.test(src)) continue;
    if (/\}\)\(\s*globalThis/.test(src)) continue;
    if (/\}\)\(\s*this\s*\)/.test(src)) continue;
    if (/\}\)\(\s*window\s*\)/.test(src)) continue;
    if (/\}\)\(\);?\s*$/.test(src.trim()) || /\}\)\(\);/.test(src)) {
      bad.push(rel);
    }
  }
  assert.equal(bad.length, 0, 'IIFE sin window: ' + bad.join(', '));
});
