/**
 * Arranque: el PIN aparece tras pocos scripts; el resto carga en defer.
 * unlockAndInitApp espera a initApp antes de ejecutar.
 */
(function (global) {
  'use strict';

  function hcAppScriptsListos() {
    return (
      typeof initApp === 'function' &&
      typeof goTab === 'function' &&
      typeof abrirSetupNuevaTorre === 'function'
    );
  }

  function hcWhenAppScriptsReady(cb, opts) {
    opts = opts || {};
    if (typeof cb !== 'function') return;
    if (hcAppScriptsListos()) {
      try {
        cb();
      } catch (e) {
        try {
          console.error('hcWhenAppScriptsReady', e);
        } catch (_) {}
      }
      return;
    }
    var maxMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 28000;
    var t0 = Date.now();
    var poll = function () {
      if (hcAppScriptsListos()) {
        try {
          cb();
        } catch (e) {
          try {
            console.error('hcWhenAppScriptsReady', e);
          } catch (_) {}
        }
        return;
      }
      if (Date.now() - t0 > maxMs) {
        try {
          if (typeof showToast === 'function') {
            showToast('La app aún carga módulos. Espera o recarga la página.', true, {
              durationMs: 6500,
            });
          }
        } catch (_) {}
        return;
      }
      setTimeout(poll, 45);
    };
    poll();
  }

  global.hcWhenAppScriptsReady = hcWhenAppScriptsReady;
  global.hcAppScriptsListos = hcAppScriptsListos;

  global.addEventListener('load', function () {
    global._hcDeferScriptsLoadEvent = true;
  });
})(typeof window !== 'undefined' ? window : globalThis);
