/**
 * Carga lazy de módulos tras PIN visible. Orden conservado.
 */
(function (global) {
  'use strict';

  var loading = false;
  var loaded = 0;
  var total = 0;
  var failed = 0;

  function hcAppScriptsListos() {
    return (
      typeof initApp === 'function' &&
      typeof goTab === 'function' &&
      typeof abrirSetupNuevaTorre === 'function'
    );
  }

  function hcBootProgressPct() {
    if (!total) return hcAppScriptsListos() ? 100 : 0;
    if (hcAppScriptsListos()) return 100;
    return Math.min(99, Math.round((loaded / total) * 100));
  }

  function hcBootUpdatePinProgress() {
    var pct = hcBootProgressPct();
    var statusEl = document.getElementById('pinAuthStatus');
    var stamp = document.getElementById('pinBuildStamp');
    if (statusEl && !global.appBootstrapped) {
      if (hcAppScriptsListos()) {
        statusEl.textContent = '';
      } else if (total > 0) {
        statusEl.textContent = 'Preparando app… ' + pct + '%';
      }
    }
    if (stamp && typeof global.APP_BUILD_VERSION !== 'undefined') {
      stamp.textContent =
        'build ' + global.APP_BUILD_VERSION + (hcAppScriptsListos() ? '' : ' · ' + pct + '%');
    }
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
    var maxMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 90000;
    var t0 = Date.now();
    var poll = function () {
      hcBootUpdatePinProgress();
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
        var err = document.getElementById('pinErr');
        if (err) {
          err.textContent =
            'La app no terminó de cargar. Recarga con Ctrl+Shift+R o borra datos del sitio.';
        }
        return;
      }
      setTimeout(poll, 40);
    };
    poll();
  }

  function loadScriptUrl(url) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = url;
      s.async = false;
      s.onload = function () {
        resolve(true);
      };
      s.onerror = function () {
        try {
          console.warn('[HidroGrow boot] omitido:', url);
        } catch (_) {}
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }

  function hcBootStartLoading() {
    if (loading || global._hcBootLoadDone) return;
    var queue = global.HC_BOOT_LAZY_SCRIPTS;
    if (!Array.isArray(queue) || !queue.length) {
      global._hcBootLoadDone = true;
      return;
    }
    loading = true;
    total = queue.length;
    loaded = 0;
    failed = 0;

    (async function () {
      for (var i = 0; i < queue.length; i++) {
        var ok = await loadScriptUrl(queue[i]);
        loaded++;
        if (!ok) failed++;
        hcBootUpdatePinProgress();
      }
      global._hcBootLoadDone = true;
      loading = false;
      hcBootUpdatePinProgress();
      try {
        global.dispatchEvent(new Event('hcBootScriptsLoaded'));
      } catch (_) {}
    })();
  }

  global.hcAppScriptsListos = hcAppScriptsListos;
  global.hcWhenAppScriptsReady = hcWhenAppScriptsReady;
  global.hcBootStartLoading = hcBootStartLoading;
  global.hcBootProgressPct = hcBootProgressPct;
  global.hcBootUpdatePinProgress = hcBootUpdatePinProgress;

  hcBootStartLoading();
})(typeof window !== 'undefined' ? window : globalThis);
