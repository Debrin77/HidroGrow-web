/**
 * Arranque: PIN al instante; módulos en fases (críticos → esenciales → diferidos).
 * El PIN solo se desbloquea cuando Inicio/Sistema/Medir tienen sus APIs (no solo el asistente).
 */
(function (global) {
  'use strict';

  var loading = false;
  var loaded = 0;
  var total = 0;
  var failed = 0;
  var criticalDone = false;
  var essentialDone = false;
  var deferredStarted = false;

  function hcBootIsMobile() {
    try {
      if (/iPad|iPhone|iPod/i.test(navigator.userAgent || '')) return true;
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
      if (global.matchMedia && global.matchMedia('(max-width: 768px)').matches) return true;
    } catch (_) {}
    return false;
  }

  /** APIs mínimas al PIN: dash, Medir y guardado del asistente (torre SVG en diferido). */
  function hcBootEssentialListos() {
    return (
      typeof updateDashboard === 'function' &&
      typeof refreshMedirOperativaUi === 'function' &&
      typeof guardarSetupYContinuar === 'function'
    );
  }

  /** PIN e initApp: críticos + APIs del asistente (esenciales siguen en paralelo). */
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
      typeof caminoUsaNutrienteBandejaPropagador === 'function'
    );
  }

  function hcBootEssentialReady() {
    return essentialDone && hcBootEssentialListos();
  }

  function hcBootQueues() {
    var critical = global.HC_BOOT_CRITICAL_SCRIPTS;
    var essential = global.HC_BOOT_ESSENTIAL_SCRIPTS;
    var deferred = global.HC_BOOT_DEFERRED_SCRIPTS;
    if (Array.isArray(critical)) {
      return {
        critical: critical,
        essential: Array.isArray(essential) ? essential : [],
        deferred: Array.isArray(deferred) ? deferred : [],
      };
    }
    var all = global.HC_BOOT_LAZY_SCRIPTS;
    if (!Array.isArray(all)) return { critical: [], essential: [], deferred: [] };
    return { critical: all, essential: [], deferred: [] };
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
    var mobile = hcBootIsMobile();
    if (statusEl && !global.appBootstrapped) {
      if (hcAppScriptsListos()) {
        statusEl.textContent = hcBootEssentialReady()
          ? 'Listo — introduce tu PIN'
          : 'Introduce tu PIN (cargando módulos en segundo plano)';
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

  function hcBootScriptUrl(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.indexOf('?') !== -1) return url;
    var v = typeof global.APP_BUILD_VERSION !== 'undefined' ? global.APP_BUILD_VERSION : '';
    return v ? url + '?v=' + encodeURIComponent(v) : url;
  }

  function loadScriptUrl(url) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = hcBootScriptUrl(url);
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
      setTimeout(done, hcBootIsMobile() ? 8 : 0);
    });
  }

  async function loadQueue(queue, opts) {
    opts = opts || {};
    var mobile = hcBootIsMobile();
    var idle = !!opts.idle;
    var batchSize = idle ? (mobile ? 3 : 5) : mobile ? 10 : 12;
    var yieldMs = idle ? (mobile ? 4 : 2) : mobile ? 2 : 0;

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
    if (!q.critical.length && !q.essential.length && !q.deferred.length) {
      global._hcBootLoadDone = true;
      return;
    }
    loading = true;
    total = q.critical.length + q.essential.length;
    loaded = 0;
    failed = 0;

    await loadQueue(q.critical);
    criticalDone = true;
    hcBootUpdatePinProgress();
    setTimeout(function () {
      try {
        if (typeof global.hcPreinitTorreStateWhileLocked === 'function') {
          global.hcPreinitTorreStateWhileLocked();
        }
      } catch (_) {}
    }, 0);

    var essentialPromise = null;
    if (q.essential.length) {
      essentialPromise = loadQueue(q.essential).then(function () {
        essentialDone = true;
        hcBootUpdatePinProgress();
        try {
          global.dispatchEvent(new Event('hcBootEssentialReady'));
        } catch (_) {}
      });
    } else {
      essentialDone = true;
    }

    var deferredPromise = null;
    if (q.deferred.length) {
      deferredStarted = true;
      deferredPromise = loadQueue(q.deferred, { idle: false });
    }

    var allDone = Promise.all([essentialPromise, deferredPromise].filter(Boolean));
    allDone
      .then(function () {
        global._hcBootLoadDone = true;
        hcBootUpdatePinProgress();
        try {
          global.dispatchEvent(new Event('hcBootScriptsLoaded'));
        } catch (_) {}
      })
      .catch(function () {
        global._hcBootLoadDone = true;
      });

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
      await loadQueue(q.deferred, { idle: false });
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
  global.hcBootScriptUrl = hcBootScriptUrl;

  setTimeout(hcBootStartLoading, 0);
})(typeof window !== 'undefined' ? window : globalThis);
