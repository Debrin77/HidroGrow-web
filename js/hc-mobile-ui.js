/**
 * Móvil: evitar zoom accidental al pulsar pestañas, inputs legibles sin zoom iOS, fluidez.
 */
(function (global) {
  'use strict';

  var TAB_IDS = ['inicio', 'mediciones', 'sala', 'sistema', 'calendario', 'riego', 'meteo', 'historial', 'consejos', 'ayuda'];

  function isCoarsePointer() {
    try {
      return global.matchMedia('(hover: none) and (pointer: coarse)').matches;
    } catch (_) {
      return false;
    }
  }

  function applyViewportNoZoom() {
    try {
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) return;
      var base =
        'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, viewport-fit=cover';
      if (meta.getAttribute('content') !== base) meta.setAttribute('content', base);
    } catch (_) {}
  }

  /** Si el navegador quedó con zoom > 1, intentar volver a escala 1 (PWA / Safari). */
  function resetPageScaleIfStuck() {
    try {
      var vv = global.visualViewport;
      if (!vv || vv.scale <= 1.02) return;
      applyViewportNoZoom();
      document.documentElement.style.zoom = '';
      if (typeof global.scrollTo === 'function') {
        global.scrollTo(0, global.scrollY || 0);
      }
    } catch (_) {}
  }

  function bindTabBarTouch() {
    var bar = document.querySelector('.tab-bar');
    if (!bar || bar._hcMobileTabBound) return;
    bar._hcMobileTabBound = true;

    var lastTap = 0;
    var lastBtn = null;
    bar.addEventListener(
      'touchend',
      function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.tab-btn') : null;
        if (!btn || !bar.contains(btn)) return;
        var now = Date.now();
        if (btn === lastBtn && now - lastTap < 380) {
          e.preventDefault();
        }
        lastTap = now;
        lastBtn = btn;
        global.setTimeout(resetPageScaleIfStuck, 80);
      },
      { passive: false }
    );

    bar.addEventListener(
      'click',
      function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.tab-btn') : null;
        if (!btn) return;
        global.setTimeout(resetPageScaleIfStuck, 120);
      },
      true
    );
  }

  function patchGoTab() {
    if (typeof global.goTab !== 'function' || global.goTab._hcMobilePatched) return;
    var orig = global.goTab;
    global.goTab = function hcGoTabMobile(tab) {
      if (tab === global.currentTab) return;
      orig(tab);
      if (isCoarsePointer()) {
        try {
          global.requestAnimationFrame(resetPageScaleIfStuck);
        } catch (_) {}
      }
    };
    global.goTab._hcMobilePatched = true;
  }

  function deferSaveStatePatch() {
    if (typeof global.saveState !== 'function' || global.saveState._hcDeferPatched) return;
    var origSave = global.saveState;
    global._hcPersistStateFlush = function () {
      if (global._hcPersistStateTimer) {
        clearTimeout(global._hcPersistStateTimer);
        global._hcPersistStateTimer = null;
      }
      return origSave();
    };
    global.hcPersistStateSoon = function () {
      if (global._hcPersistStateTimer) clearTimeout(global._hcPersistStateTimer);
      global._hcPersistStateTimer = global.setTimeout(function () {
        global._hcPersistStateTimer = null;
        try {
          origSave();
        } catch (_) {}
      }, 180);
    };
    global.saveState._hcDeferPatched = true;
  }

  function initMobileUi() {
    applyViewportNoZoom();
    bindTabBarTouch();
    patchGoTab();
    deferSaveStatePatch();
    if (global.visualViewport) {
      global.visualViewport.addEventListener('resize', function () {
        if (global.visualViewport.scale > 1.05) resetPageScaleIfStuck();
      });
    }
    global.addEventListener('orientationchange', function () {
      global.setTimeout(applyViewportNoZoom, 100);
      global.setTimeout(resetPageScaleIfStuck, 200);
    });
    global.addEventListener('pagehide', function () {
      if (typeof global._hcPersistStateFlush === 'function') global._hcPersistStateFlush();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && typeof global._hcPersistStateFlush === 'function') {
        global._hcPersistStateFlush();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileUi);
  } else {
    initMobileUi();
  }

  global.hcResetMobilePageScale = resetPageScaleIfStuck;
  global.initHidroGrowMobileUi = initMobileUi;
})(typeof window !== 'undefined' ? window : globalThis);
