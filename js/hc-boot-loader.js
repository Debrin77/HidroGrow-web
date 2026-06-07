/**
 * Arranque: PIN al instante; módulos en fases (críticos → diagramas).
 * En iPhone: pausas entre lotes para que el PIN responda.
 */
(function (global) {
  'use strict';

  var loading = false;
  var loaded = 0;
  var total = 0;
  var failed = 0;
  var criticalDone = false;
  var deferredStarted = false;

  function hcBootIsMobile() {
    try {
      if (/iPad|iPhone|iPod/i.test(navigator.userAgent || '')) return true;
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
      if (global.matchMedia && global.matchMedia('(max-width: 768px)').matches) return true;
    } catch (_) {}
    return false;
  }

  /** No desbloquear PIN ni initApp hasta críticos + asistente + propagador. */
  function hcAppScriptsListos() {
    if (!criticalDone) return false;
    return (
      typeof initApp === 'function' &&
      typeof goTab === 'function' &&
      typeof mostrarBienvenidaOContinuarArranque === 'function' &&
      (typeof abrirSetupNuevaTorre === 'function' || typeof abrirSetup === 'function') &&
      typeof renderSetupPage === 'function' &&
      typeof seleccionarCaminoCultivo === 'function' &&
      typeof getCaminoElegidoEnAsistente === 'function' &&
      typeof validarPremiumSetupPaso === 'function' &&
      typeof hcMostrarSistemaPropagador === 'function' &&
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      typeof caminoUsaNutrienteBandejaPropagador === 'function' &&
      typeof guardarSetupYContinuar === 'function' &&
      typeof setupNext === 'function'
    );
  }

  function hcBootQueues() {
    var critical = global.HC_BOOT_CRITICAL_SCRIPTS;
    var deferred = global.HC_BOOT_DEFERRED_SCRIPTS;
    if (Array.isArray(critical) && Array.isArray(deferred)) {
      return { critical: critical, deferred: deferred };
    }
    var all = global.HC_BOOT_LAZY_SCRIPTS;
    if (!Array.isArray(all)) return { critical: [], deferred: [] };
    return { critical: all, deferred: [] };
  }

  function hcBootProgressPct() {
    if (!total) return hcAppScriptsListos() ? 100 : 0;
    if (hcAppScriptsListos() && criticalDone) return 100;
    return Math.min(99, Math.round((loaded / total) * 100));
  }

  function hcBootUpdatePinProgress() {
    var pct = hcBootProgressPct();
    var statusEl = document.getElementById('pinAuthStatus');
    var stamp = document.getElementById('pinBuildStamp');
    var mobile = hcBootIsMobile();
    if (statusEl && !global.appBootstrapped) {
      if (hcAppScriptsListos()) {
        statusEl.textContent = mobile ? 'Listo — introduce tu PIN' : '';
      } else if (total > 0) {
        statusEl.textContent = 'Preparando… ' + pct + '%';
      }
    }
    if (stamp && typeof global.APP_BUILD_VERSION !== 'undefined') {
      stamp.textContent =
        'build ' + global.APP_BUILD_VERSION + (hcAppScriptsListos() ? ' · OK' : ' · ' + pct + '%');
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
    var maxMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 120000;
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
          err.textContent = hcBootIsMobile()
            ? 'No terminó de cargar. Cierra la app, bórrala de Inicio y ábrela de nuevo.'
            : 'No terminó de cargar. Recarga con Ctrl+Shift+R.';
        }
        return;
      }
      setTimeout(poll, hcBootIsMobile() ? 80 : 40);
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

  function hcBootYield(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function hcBootScheduleChunk(cb) {
    return new Promise(function (resolve) {
      var done = function () {
        try {
          cb();
        } catch (_) {}
        resolve();
      };
      if (hcBootIsMobile() && typeof global.requestIdleCallback === 'function') {
        global.requestIdleCallback(done, { timeout: 120 });
      } else {
        setTimeout(done, hcBootIsMobile() ? 12 : 0);
      }
    });
  }

  async function loadQueue(queue, opts) {
    opts = opts || {};
    var mobile = hcBootIsMobile();
    var idle = !!opts.idle;
    var batchSize = idle ? 1 : mobile ? 2 : 4;
    var yieldMs = idle ? 0 : mobile ? 16 : 8;

    for (var i = 0; i < queue.length; i += batchSize) {
      if (idle) {
        await hcBootScheduleChunk(function () {});
      }
      var slice = queue.slice(i, i + batchSize);
      var results = await Promise.all(
        slice.map(function (url) {
          return loadScriptUrl(url);
        })
      );
      for (var r = 0; r < results.length; r++) {
        loaded++;
        if (!results[r]) failed++;
      }
      hcBootUpdatePinProgress();
      if (i + batchSize < queue.length) {
        if (idle) {
          await hcBootScheduleChunk(function () {});
        } else if (yieldMs) {
          await hcBootYield(yieldMs);
        }
      }
    }
  }

  async function hcBootStartLoading() {
    if (loading || global._hcBootLoadDone) return;
    var q = hcBootQueues();
    if (!q.critical.length && !q.deferred.length) {
      global._hcBootLoadDone = true;
      return;
    }
    loading = true;
    total = q.critical.length;
    loaded = 0;
    failed = 0;

    await loadQueue(q.critical);
    criticalDone = true;
    hcBootUpdatePinProgress();

    if (q.deferred.length) {
      if (hcBootIsMobile()) {
        /* Adelantar diferidos mientras el usuario ve el PIN (no bloquear pestañas tras desbloqueo). */
        hcBootStartDeferredPhase();
      } else {
        await loadQueue(q.deferred);
        global._hcBootLoadDone = true;
        try {
          global.dispatchEvent(new Event('hcBootScriptsLoaded'));
        } catch (_) {}
      }
    } else {
      global._hcBootLoadDone = true;
      try {
        global.dispatchEvent(new Event('hcBootScriptsLoaded'));
      } catch (_) {}
    }

    loading = false;
  }

  function hcBootStartDeferredPhase() {
    if (deferredStarted || global._hcBootLoadDone) return;
    var q = hcBootQueues();
    if (!q.deferred.length) {
      global._hcBootLoadDone = true;
      return;
    }
    deferredStarted = true;
    (async function () {
      await loadQueue(q.deferred, { idle: true });
      global._hcBootLoadDone = true;
      hcBootUpdatePinProgress();
      try {
        global.dispatchEvent(new Event('hcBootScriptsLoaded'));
      } catch (_) {}
    })();
  }

  global.hcAppScriptsListos = hcAppScriptsListos;
  global.hcWhenAppScriptsReady = hcWhenAppScriptsReady;
  global.hcBootStartLoading = hcBootStartLoading;
  global.hcBootStartDeferredPhase = hcBootStartDeferredPhase;
  global.hcBootProgressPct = hcBootProgressPct;
  global.hcBootUpdatePinProgress = hcBootUpdatePinProgress;
  global.hcBootIsMobile = hcBootIsMobile;

  var bootDelay = hcBootIsMobile() ? 150 : 16;
  setTimeout(hcBootStartLoading, bootDelay);
})(typeof window !== 'undefined' ? window : globalThis);
