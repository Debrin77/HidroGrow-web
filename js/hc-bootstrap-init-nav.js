/**
 * resetApp, initApp, reloj, a11y de diálogos, goTab, irMedirMunicipioClima.
 * Tras onboarding; antes de torre-render-build.js / torre-render-main.js (initApp/goTab en runtime).
 */
// ══════════════════════════════════════════════════
// INIT APP
// ══════════════════════════════════════════════════
function hcResetSessionUiFlags() {
  try {
    if (typeof window === 'undefined') return;
    if (typeof hcInvalidateTabDomCache === 'function') hcInvalidateTabDomCache();
    if (typeof hcInvalidateTabHeavyCache === 'function') hcInvalidateTabHeavyCache();
    window._hcMedirSalaLayoutDone = false;
    window._hcMedirSalaLayoutScheduled = false;
    window._hcPreinitTorreDone = false;
    window._hcPostSetupChecklistPreguntaMostrada = false;
    delete window._hcPostSetupPrevListo;
    delete window._hcChecklistGuidedFlow;
    delete window._hcSetupWizardCompletadoTs;
    delete window._hcSalaPreGermRecienGuardada;
    if (typeof hcInvalidateSalaTabHeavyCache === 'function') hcInvalidateSalaTabHeavyCache();
  } catch (_) {}
}

function hcFinishResetHeavyWork() {
  const appEl = document.getElementById('app');
  try {
    if (typeof hcPrepararEstadoSinInstalacionEnMemoria === 'function') {
      hcPrepararEstadoSinInstalacionEnMemoria();
    }
    if (typeof hcRefreshDashSinInstalacionUi === 'function') hcRefreshDashSinInstalacionUi();
    if (typeof refreshTabsOperativaCamino === 'function') {
      refreshTabsOperativaCamino();
    }
    if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
    if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi();
    if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
    if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
  } catch (e) {
    try {
      console.error('hcFinishResetHeavyWork', e);
    } catch (_) {}
  } finally {
    if (appEl) appEl.classList.remove('hc-app-booting');
  }
  try {
    if (typeof mostrarBienvenidaOContinuarArranque === 'function') {
      mostrarBienvenidaOContinuarArranque();
    }
  } catch (_) {}
  if (typeof showToast === 'function') {
    showToast('🔄 Sistema restablecido', false, { durationMs: 4800 });
  }
}

async function resetApp() {
  if (!confirm('⚠️ ¿Estás seguro? Esta acción borrará TODOS los datos guardados en este dispositivo, incluyendo plantas, mediciones y configuración.')) return;
  if (!confirm('⚠️ Segunda confirmación — esta acción NO se puede deshacer. ¿Continuar?')) return;

  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.add('hc-app-booting');
  if (typeof showToast === 'function') {
    showToast('Restableciendo sistema…', false, { durationMs: 2200 });
  }

  try {
    sessionStorage.clear();
  } catch (_) {}
  try {
    if (typeof hidrogrowLimpiarAlmacenamientoCompleto === 'function') {
      hidrogrowLimpiarAlmacenamientoCompleto({ skipIndexedDb: true });
    }
    localStorage.setItem('hc_forzar_bienvenida_tras_reset', '1');
    sessionStorage.setItem('hc_forzar_bienvenida_tras_reset', '1');
  } catch (_) {}
  try {
    if (typeof vaciarFotoDBEnArranque === 'function') {
      await vaciarFotoDBEnArranque();
    }
  } catch (e) {
    try {
      console.warn('resetApp storage', e);
    } catch (_) {}
  }

  hcResetSessionUiFlags();

  try {
    if (typeof hcResetSetupWizardSession === 'function') hcResetSetupWizardSession();
  } catch (_) {}

  try {
    const _tbc = document.getElementById('hcTabBarCoach');
    if (_tbc) _tbc.classList.add('setup-hidden');
    document.body.classList.remove('hc-tab-coach-open');
    const _clOv = document.getElementById('checklistOverlay');
    if (_clOv) _clOv.classList.remove('open', 'checklist-overlay--guided-flow');
    const _setup = document.getElementById('setupOverlay');
    if (_setup) _setup.classList.remove('open');
  } catch (_) {}

  state = initState();
  modoActual = 'vegetativo';
  clEsPrimeraVez = true;
  currentTab = 'inicio';

  try {
    if (typeof hcPrepararEstadoSinInstalacionEnMemoria === 'function') {
      hcPrepararEstadoSinInstalacionEnMemoria();
    }
    if (typeof initTorres === 'function') initTorres();
    if (typeof window !== 'undefined') window._hcPreinitTorreDone = true;
    if (typeof saveState === 'function') saveState();
  } catch (_) {}

  try {
    if (typeof refreshTabsOperativaCamino === 'function') {
      refreshTabsOperativaCamino({ visibilidadOnly: true });
    }
    if (typeof actualizarHeaderTorre === 'function') actualizarHeaderTorre();
    if (typeof refreshModoInfoText === 'function') refreshModoInfoText();
  } catch (_) {}

  try {
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    const panel = document.getElementById('tab-inicio');
    const btn = document.getElementById('btn-inicio');
    if (panel) {
      panel.classList.add('active');
      panel.setAttribute('aria-hidden', 'false');
    }
    if (btn) btn.classList.add('active');
  } catch (_) {}

  if (typeof showToast === 'function') {
    showToast('🔄 Sistema restablecido · recargando…', false, { durationMs: 2200 });
  }
  setTimeout(function () {
    try {
      location.reload();
    } catch (_) {
      location.href = location.href;
    }
  }, 380);
}

/** Carga torres + datos en memoria (sin pintar UI pesada). */
function hcCargarTorreActivaEnMemoria(opts) {
  const deferUi = !(opts && opts.deferUi === false);
  initTorres();
  if (typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario()) {
    reconciliarSlotTorreActivaAntesDeCargar();
    cargarEstadoTorre(state.torreActiva || 0, deferUi ? { deferUi: true } : undefined);
  } else if (typeof hcPrepararEstadoSinInstalacionEnMemoria === 'function') {
    hcPrepararEstadoSinInstalacionEnMemoria();
  }
}

/** Mientras el PIN está visible: adelantar lectura de localStorage. */
function hcPreinitTorreStateWhileLocked() {
  if (typeof window !== 'undefined' && window._hcPreinitTorreDone) return;
  try {
    hcCargarTorreActivaEnMemoria({ deferUi: true });
    if (typeof window !== 'undefined') window._hcPreinitTorreDone = true;
  } catch (e) {
    try {
      console.warn('hcPreinitTorreStateWhileLocked', e);
    } catch (_) {}
  }
}

function hcResolveTabActivaBoot() {
  const t = typeof currentTab !== 'undefined' ? currentTab : 'inicio';
  const panel = document.getElementById('tab-' + t);
  if (panel && panel.classList.contains('active')) return t;
  return 'inicio';
}

function hcFinishInitAppHeavyWork() {
  const appEl = document.getElementById('app');
  const tab = hcResolveTabActivaBoot();
  if (appEl) appEl.classList.remove('hc-app-booting');

  try {
    var setupAbierto = false;
    try {
      var so = document.getElementById('setupOverlay');
      setupAbierto = !!(so && so.classList.contains('open'));
    } catch (_) {}
    if (!setupAbierto && tab === 'inicio' && typeof updateDashboard === 'function') {
      updateDashboard({ lite: true });
      var runDashFull = function () {
        try {
          updateDashboard();
        } catch (eFull) {
          try {
            console.error('dashboard completo en initApp', eFull);
          } catch (_) {}
        }
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(runDashFull, { timeout: 900 });
      } else {
        setTimeout(runDashFull, 60);
      }
    } else if (!setupAbierto && typeof goTabDeferredWork === 'function') {
      goTabDeferredWork(tab);
    }
  } catch (eDash) {
    try {
      console.error('dashboard en initApp', eDash);
    } catch (_) {}
  }

  requestAnimationFrame(function () {
    try {
      if (typeof hcApplyCargarTorreUiPendiente === 'function') {
        hcApplyCargarTorreUiPendiente({ tab: tab, boot: true });
      }
      if (typeof hcApplyCargarTorreRiegoPendiente === 'function') {
        hcApplyCargarTorreRiegoPendiente();
      }
    } catch (eCfg) {
      try {
        console.error('cargarTorreUi en initApp', eCfg);
      } catch (_) {}
    }
  });

  var runCaminoUi = function () {
    var setupAbiertoIdle = false;
    try {
      var soIdle = document.getElementById('setupOverlay');
      setupAbiertoIdle = !!(soIdle && soIdle.classList.contains('open'));
    } catch (_) {}
    try {
      if (typeof refreshTabsOperativaCamino === 'function') refreshTabsOperativaCamino();
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
      if (!setupAbiertoIdle && typeof refreshDashGerminacionHub === 'function') {
        refreshDashGerminacionHub();
      }
      if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner();
      if (typeof refreshDashNotificacionesUI === 'function') refreshDashNotificacionesUI();
      if (tab === 'sala' && typeof ensureSalaCultivoEquipMountEnTabRoot === 'function') {
        ensureSalaCultivoEquipMountEnTabRoot();
      }
      if (tab === 'sala' && typeof applySalaMontajeRecomendadoUi === 'function') {
        applySalaMontajeRecomendadoUi();
      }
    } catch (_) {}
  };

  var runBackground = function () {
    runCaminoUi();
    try {
      if (
        typeof getCaminoCultivo === 'function' &&
        getCaminoCultivo(state.configTorre || {}) === 'semilla_propagador'
      ) {
        var dimsDirty = false;
        if (typeof hidrogrowDimsTorreDesdeConfig === 'function' && state.configTorre) {
          const dimsBoot = hidrogrowDimsTorreDesdeConfig(state.configTorre, state.torre);
          if (
            state.configTorre.numNiveles !== dimsBoot.numNiveles ||
            state.configTorre.numCestas !== dimsBoot.numCestas
          ) {
            dimsDirty = true;
          }
          state.configTorre.numNiveles = dimsBoot.numNiveles;
          state.configTorre.numCestas = dimsBoot.numCestas;
          if (Array.isArray(state.torre) && state.torre.length > 1) {
            state.torre = [state.torre[0] || []];
            dimsDirty = true;
          }
        }
        var needGermSync =
          dimsDirty ||
          (typeof hcPropagadorTorreNecesitaAjuste === 'function' &&
            state.configTorre &&
            hcPropagadorTorreNecesitaAjuste(
              state.configTorre,
              typeof hcNumSemillasGermConfig === 'function'
                ? hcNumSemillasGermConfig(state.configTorre)
                : 0
            ));
        if (needGermSync && typeof hcSyncGerminacionPlanCultivo === 'function') {
          hcSyncGerminacionPlanCultivo(state.configTorre);
        }
        if (dimsDirty && typeof saveState === 'function') saveState();
      }
      if (tab === 'mediciones' && typeof renderTorreMedirDiagram === 'function') {
        renderTorreMedirDiagram();
      }
      if (tab === 'riego' && typeof actualizarVistaRiegoPorTipoInstalacion === 'function') {
        actualizarVistaRiegoPorTipoInstalacion();
      }
    } catch (_) {}
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(runBackground, { timeout: 3500 });
  } else {
    setTimeout(runBackground, 400);
  }
}

function initApp() {
  try {
    try {
      if (typeof hcScrollAppToTop === 'function') hcScrollAppToTop();
    } catch (_) {}
    try {
      if (typeof initTorres === 'function') initTorres();
    } catch (eTorInit) {
      try {
        console.error('initTorres en initApp', eTorInit);
      } catch (_) {}
      try {
        if (!state || typeof state !== 'object') {
          state = typeof initState === 'function' ? initState() : { torres: [], torre: [], torreActiva: 0 };
        }
      } catch (_) {}
    }
    updateClock();
    setInterval(updateClock, 30000);
    const modoSel = document.getElementById('modoSelector');
    if (modoSel) {
      modoSel.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('active'));
      const modoBtn = document.getElementById('modo-' + modoActual);
      if (modoBtn) modoBtn.classList.add('active');
    }
    try {
      const hayInst =
        typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario();
      if (!hayInst) {
        if (typeof hcPrepararEstadoSinInstalacionEnMemoria === 'function') {
          hcPrepararEstadoSinInstalacionEnMemoria();
        }
      } else if (typeof window !== 'undefined' && window._hcPreinitTorreDone) {
        /* datos ya cargados en segundo plano durante el PIN */
      } else {
        hcCargarTorreActivaEnMemoria({ deferUi: true });
        if (typeof window !== 'undefined') window._hcPreinitTorreDone = true;
      }
    } catch (eTorres) {
      try {
        console.error('cargarEstadoTorre en initApp', eTorres);
      } catch (_) {}
    }
    applyBootCollapsedUI();
    try {
      actualizarHeaderTorre();
    } catch (eHdr) {
      try {
        console.error('header en initApp', eHdr);
      } catch (_) {}
    }
    try {
      mostrarBtnNotificaciones();
    } catch (_) {}
    setInterval(function () {
      try {
        updateDashboard();
      } catch (_) {}
    }, 300000);
    setTimeout(function () {
      try {
        programarRecordatorios();
      } catch (_) {}
    }, 12000);
    setTimeout(function () {
      try {
        void refrescarAvisosMeteoalarmEnSegundoPlano();
      } catch (_) {}
    }, 15000);
    setTimeout(function () {
      try {
        actualizarBadgesNutriente();
      } catch (_) {}
    }, 3000);
    try {
      if (typeof mostrarBienvenidaOContinuarArranque === 'function') {
        requestAnimationFrame(function () {
          mostrarBienvenidaOContinuarArranque();
        });
      } else if (typeof hcAbrirAsistenteCaminoSiSinInstalacion === 'function') {
        requestAnimationFrame(function () {
          try {
            hcAbrirAsistenteCaminoSiSinInstalacion();
          } catch (_) {}
        });
      }
    } catch (_) {}
    setTimeout(function () {
      try {
        if (state && state.hcPostSetupChecklistPendiente && typeof actualizarPostSetupChecklistRail === 'function') {
          actualizarPostSetupChecklistRail();
        }
      } catch (_) {}
    }, 1400);
    setTimeout(function () {
      try {
        abrirFotoDB()
          .then(function () {
            try {
              migrarFotosAIDB();
            } catch (_) {}
          })
          .catch(function (e) {
            try {
              console.warn('Migración IDB:', e);
            } catch (_) {}
          });
      } catch (_) {}
    }, 8000);

    if (!window._a11yEscapeBound) {
      window._a11yEscapeBound = true;
      document.addEventListener('keydown', a11yEscapeTopDialog);
    }
    try {
      if (typeof initHidroCultivoTabBarA11y === 'function') initHidroCultivoTabBarA11y();
    } catch (_) {}
    try {
      if (typeof window._hcSyncMainTabTabIndex === 'function') window._hcSyncMainTabTabIndex();
    } catch (_) {}
    try {
      if (typeof initHistorialTabBarA11y === 'function') initHistorialTabBarA11y();
    } catch (_) {}
    try {
      if (typeof window._hcSyncHistorialTabTabIndex === 'function') window._hcSyncHistorialTabTabIndex();
    } catch (_) {}

    setTimeout(hcFinishInitAppHeavyWork, 0);
  } catch (e) {
    try {
      console.error('initApp', e);
    } catch (_) {}
    throw e;
  }
}

/**
 * Arranque: forzar paneles plegados para iniciar con UI limpia.
 * No altera el comportamiento de los toggles durante la sesión.
 */
function applyBootCollapsedUI() {
  if (!state || typeof state !== 'object') return;
  try {
    if (!state.notifOpciones || typeof state.notifOpciones !== 'object') state.notifOpciones = {};
    state.notifOpciones.panelInicioColapsado = true;
  } catch (_) {}

  const cfg = state.configTorre || null;
  if (!cfg || typeof cfg !== 'object') return;

  if (!cfg.uiMedirCollapse || typeof cfg.uiMedirCollapse !== 'object' || Array.isArray(cfg.uiMedirCollapse)) {
    cfg.uiMedirCollapse = {};
  }
  cfg.uiMedirCollapse.recargaProxima = false;
  cfg.uiMedirCollapse.luzOrigen = false;
  cfg.uiMedirCollapse.recargaTotal = false;
  cfg.uiMedirCollapse.recargaParcial = false;
  cfg.uiMedirCollapse.interiorGrow = false;
  cfg.uiMedirCollapse.calentadorRiego = false;

  cfg.uiSistemaNftMontajeColapsado = true;
  cfg.uiSistemaDwcColapsado = true;
  cfg.uiSistemaDwcLlenadoColapsado = true;
}
function updateClock() {
  const el = document.getElementById('headerTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// ══════════════════════════════════════════════════
// NAVEGACIÓN
// ══════════════════════════════════════════════════
/** Enter/Espacio en elementos role="button" con tabindex */
function a11yKeyActivate(ev, fn) {
  if (ev.key === 'Enter' || ev.key === ' ') {
    ev.preventDefault();
    if (typeof fn === 'function') fn();
  }
}

const _a11yDialogFocusReturn = [];

/** Misma lista que el foco inicial del diálogo; filtra nodos realmente visibles. */
const A11Y_FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function a11yCollectFocusables(rootEl) {
  if (!rootEl) return [];
  return Array.from(rootEl.querySelectorAll(A11Y_FOCUSABLE_SELECTOR)).filter(node => {
    if (!(node instanceof HTMLElement)) return false;
    if (node.getAttribute('aria-hidden') === 'true') return false;
    const st = getComputedStyle(node);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = node.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  });
}

function a11yAttachFocusTrap(rootEl) {
  if (!rootEl || rootEl._a11yFocusTrapHandler) return;
  const handler = e => {
    if (e.key !== 'Tab') return;
    const list = a11yCollectFocusables(rootEl);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (!rootEl.contains(active)) {
      e.preventDefault();
      first.focus();
      return;
    }
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };
  rootEl._a11yFocusTrapHandler = handler;
  rootEl.addEventListener('keydown', handler, true);
}

function a11yDetachFocusTrap(rootEl) {
  if (!rootEl || !rootEl._a11yFocusTrapHandler) return;
  rootEl.removeEventListener('keydown', rootEl._a11yFocusTrapHandler, true);
  delete rootEl._a11yFocusTrapHandler;
}

function a11yDialogOpened(rootEl) {
  if (!rootEl || rootEl.dataset.a11yFocusPushed) return;
  rootEl.dataset.a11yFocusPushed = '1';
  rootEl.setAttribute('aria-hidden', 'false');
  _a11yDialogFocusReturn.push(document.activeElement);
  a11yAttachFocusTrap(rootEl);
  requestAnimationFrame(() => {
    const list = a11yCollectFocusables(rootEl);
    const node = list[0];
    if (node) {
      node.focus();
      return;
    }
    if (!rootEl.hasAttribute('tabindex')) {
      rootEl.setAttribute('tabindex', '-1');
      rootEl.dataset.a11yTabindexInjected = '1';
    }
    try { rootEl.focus(); } catch (_) {}
  });
}

function a11yDialogClosed(rootEl) {
  if (!rootEl || !rootEl.dataset.a11yFocusPushed) return;
  a11yDetachFocusTrap(rootEl);
  delete rootEl.dataset.a11yFocusPushed;
  rootEl.setAttribute('aria-hidden', 'true');
  if (rootEl.dataset.a11yTabindexInjected === '1') {
    rootEl.removeAttribute('tabindex');
    delete rootEl.dataset.a11yTabindexInjected;
  }
  const prev = _a11yDialogFocusReturn.pop();
  if (prev && typeof prev.focus === 'function') {
    try { prev.focus(); } catch (e) {}
  }
}

function cerrarModalAgua(ev) {
  const el = document.getElementById('modalAgua');
  if (!el || !el.classList.contains('open')) return;
  if (ev && ev.currentTarget === el && ev.target !== el) return;
  el.classList.remove('open');
  a11yDialogClosed(el);
}

function a11yEscapeTopDialog(ev) {
  if (ev.key !== 'Escape' || ev.defaultPrevented) return;
  const clr = document.getElementById('checklistRutaRecargaOverlay');
  if (clr) {
    ev.preventDefault();
    cerrarOverlayRutaChecklistRecarga();
    return;
  }
  const cld = document.getElementById('checklistDatosInstalacionOverlay');
  if (cld) {
    ev.preventDefault();
    cerrarOverlayChecklistDatosInstalacion();
    return;
  }
  const clTab = document.getElementById('checklistTablaCultivosOverlay');
  if (clTab) {
    ev.preventDefault();
    cerrarOverlayTablaCultivosChecklist();
    return;
  }
  const order = ['modalConsejosTablaPersonal', 'modalOverlay', 'checklistOverlay', 'setupOverlay', 'modalTorres', 'modalAgua'];
  for (const id of order) {
    const el = document.getElementById(id);
    if (el && el.classList.contains('open')) {
      if (id === 'checklistOverlay' && typeof clEsPrimeraVez !== 'undefined' && clEsPrimeraVez) return;
      ev.preventDefault();
      if (id === 'modalConsejosTablaPersonal') {
        cerrarModalConsejosTablaPersonal();
      } else if (id === 'modalOverlay') {
        document.getElementById('modalOverlay').classList.remove('open');
        editingCesta = null;
        a11yDialogClosed(el);
      } else if (id === 'checklistOverlay') {
        cerrarChecklist();
      } else if (id === 'setupOverlay') {
        cerrarSetup();
      } else if (id === 'modalTorres') {
        el.classList.remove('open');
        a11yDialogClosed(el);
      } else if (id === 'modalAgua') {
        cerrarModalAgua();
      }
      return;
    }
  }
}

function activarNotificacionesDesdeInicio(ev) {
  const el = ev.currentTarget;
  pedirPermisoNotificaciones().then(ok => {
    if (ok) {
      showToast('🔔 Permiso concedido. MeteoAlarm en tu zona se avisa automáticamente; recarga, medición y cosecha solo si las marcas abajo.');
      el.style.display = 'none';
      if (typeof refreshDashNotificacionesUI === 'function') refreshDashNotificacionesUI();
    } else {
      showToast('Actívalas en Ajustes del navegador', true);
    }
  });
}

/** Centra la pestaña activa en la barra inferior cuando hay scroll horizontal (móviles estrechos). */
function scrollTabBarToActive(btn) {
  if (!btn) return;
  const bar = btn.closest('.tab-bar');
  if (!bar || bar.scrollWidth <= bar.clientWidth + 2) return;
  requestAnimationFrame(() => {
    btn.scrollIntoView({
      behavior: 'auto',
      inline: 'center',
      block: 'nearest',
    });
  });
}

var _hcTabPanelsCache = null;
var _hcTabBtnsCache = null;
var _hcGoTabWorkGen = 0;
var _hcTabPersistTimer = null;
var _hcTabHeavyLast = {};
var _hcTabEverVisited = {};
var HC_TAB_HEAVY_COOLDOWN_MS = 180000;

function hcInvalidateTabDomCache() {
  _hcTabPanelsCache = null;
  _hcTabBtnsCache = null;
}

function hcInvalidateTabHeavyCache(tab) {
  if (tab) {
    delete _hcTabHeavyLast[tab];
    delete _hcTabEverVisited[tab];
    return;
  }
  _hcTabHeavyLast = {};
  _hcTabEverVisited = {};
}

function hcTabNeedsHeavyRefresh(tab) {
  if (!_hcTabEverVisited[tab]) return true;
  var last = _hcTabHeavyLast[tab] || 0;
  return Date.now() - last > HC_TAB_HEAVY_COOLDOWN_MS;
}

function hcTabLeavingNeedsPersist(tab) {
  return tab === 'sistema' || tab === 'mediciones' || tab === 'sala' || tab === 'historial';
}

function hcScheduleTabPersist(prevTab) {
  if (!hcTabLeavingNeedsPersist(prevTab)) return;
  if (_hcTabPersistTimer) clearTimeout(_hcTabPersistTimer);
  _hcTabPersistTimer = setTimeout(function () {
    _hcTabPersistTimer = null;
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    } catch (_) {}
    try {
      if (typeof hcPersistStateSoon === 'function') hcPersistStateSoon();
    } catch (_) {}
  }, 1200);
}

function hcWhenDiagramScriptsReady(cb) {
  if (typeof cb !== 'function') return;
  if (typeof generarSVGDwc === 'function' || typeof renderTorre === 'function') {
    try {
      cb();
    } catch (_) {}
    return;
  }
  var n = 0;
  var t = setInterval(function () {
    if (typeof generarSVGDwc === 'function' || typeof renderTorre === 'function' || ++n > 100) {
      clearInterval(t);
      try {
        cb();
      } catch (_) {}
    }
  }, 40);
}

function hcWhenCalendarioReady(cb) {
  if (typeof cb !== 'function') return;
  if (typeof renderCalendario === 'function') {
    try {
      cb();
    } catch (_) {}
    return;
  }
  var n = 0;
  var t = setInterval(function () {
    if (typeof renderCalendario === 'function' || ++n > 120) {
      clearInterval(t);
      try {
        cb();
      } catch (_) {}
    }
  }, 40);
}

function hcRefreshCalendarioTab(gen) {
  var run = function () {
    if (gen != null && gen !== _hcGoTabWorkGen) return;
    try {
      if (typeof renderCalendario !== 'function') return;
      renderCalendario();
      _hcTabHeavyLast.calendario = Date.now();
    } catch (_) {}
  };
  hcWhenCalendarioReady(run);
}

function goTabDeferredWorkLite(tab) {
  try {
    if (typeof refreshTabsOperativaUi === 'function') {
      refreshTabsOperativaUi({ visibilidadOnly: true });
    }
  } catch (_) {}
  if (typeof aplicarEstadoStandbyUI === 'function') aplicarEstadoStandbyUI();
  if (typeof window._hcSyncMainTabTabIndex === 'function') window._hcSyncMainTabTabIndex();
}

function goTabDeferredWorkHeavy(tab, gen) {
  if (gen !== _hcGoTabWorkGen) return;
  var nowHeavy = Date.now();
  var lastHeavy = _hcTabHeavyLast[tab] || 0;
  var skipHeavy = nowHeavy - lastHeavy < HC_TAB_HEAVY_COOLDOWN_MS;
  if (skipHeavy) {
    if (tab === 'calendario' && typeof renderCalendario !== 'function') {
      hcRefreshCalendarioTab(gen);
    }
    return;
  }
  if (
    (tab === 'mediciones' || tab === 'sala') &&
    typeof hcInitMedirSalaLayout === 'function' &&
    !window._hcMedirSalaLayoutDone
  ) {
    window._hcMedirSalaLayoutDone = true;
    try {
      hcInitMedirSalaLayout();
    } catch (_) {}
  }
  if (tab === 'mediciones') {
    if (typeof cargarUltimaMedicion === 'function') cargarUltimaMedicion();
    if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
    var runMedirHeavy = function () {
      if (gen !== _hcGoTabWorkGen) return;
      if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
      if (typeof refreshMedirTareasHoyBadge === 'function') refreshMedirTareasHoyBadge();
      if (typeof renderMonitorSistemaPanel === 'function') renderMonitorSistemaPanel();
      if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi();
      if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
    };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(runMedirHeavy, { timeout: 2200 });
    } else {
      setTimeout(runMedirHeavy, 32);
    }
  }
  if (tab === 'sala') {
    if (typeof ensureSalaCultivoEquipMountEnTabRoot === 'function') {
      ensureSalaCultivoEquipMountEnTabRoot();
    }
    if (typeof applySalaMontajeRecomendadoUi === 'function') {
      applySalaMontajeRecomendadoUi();
    }
    if (typeof salaSubTab === 'function') salaSubTab(window.salaSubActive || 'agua');
    if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
    if (typeof hcRefreshSalaTab === 'function') {
      hcRefreshSalaTab({ deferHeavy: true });
    }
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
  }
  if (tab === 'inicio' && typeof updateDashboard === 'function') {
    updateDashboard({ lite: true });
    var runDashTab = function () {
      if (gen !== _hcGoTabWorkGen) return;
      try {
        updateDashboard();
      } catch (_) {}
    };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(runDashTab, { timeout: 700 });
    } else {
      setTimeout(runDashTab, 48);
    }
  }
  if (tab === 'meteo') {
    try {
      cargarMeteo();
      window._meteoObsoleto = false;
    } catch (_) {}
  }
  if (tab === 'calendario') {
    hcRefreshCalendarioTab(gen);
  }
  if (tab === 'sistema') {
    const cfgSistema =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    const modoFase =
      typeof hcMostrarSistemaFaseCamino === 'function' && hcMostrarSistemaFaseCamino(cfgSistema);
    const bloquearEsquemaPorFase =
      typeof hcRenderTorreBloqueadoPorFaseCamino === 'function' &&
      hcRenderTorreBloqueadoPorFaseCamino(cfgSistema);
    const runSistema = function () {
      if (gen !== _hcGoTabWorkGen) return;
      if (modoFase) {
        if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
        else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
          hcRefreshSistemaPropagadorPanel();
        } else if (!bloquearEsquemaPorFase && typeof renderTorre === 'function') {
          renderTorre();
        }
        return;
      }
      if (typeof renderTorre !== 'function') return;
      renderTorre();
      if (typeof hcRefreshSistemaCultivoExtras === 'function') hcRefreshSistemaCultivoExtras();
      requestAnimationFrame(function () {
        if (gen !== _hcGoTabWorkGen) return;
        try {
          const w = document.getElementById('torreSVGWrap');
          if (w && w.querySelector('.torre-loading-placeholder') && typeof renderTorre === 'function') {
            renderTorre();
          }
        } catch (_) {}
      });
      if (typeof renderCompatGrid === 'function') renderCompatGrid();
      if (typeof calcularRotacion === 'function') calcularRotacion();
      const postSetupCultivos =
        typeof state !== 'undefined' && state && state.hcPostSetupChecklistPendiente;
      if (!postSetupCultivos && typeof abrirTutorialTorrePestanaSiPrimeraVez === 'function') {
        setTimeout(function () {
          if (gen === _hcGoTabWorkGen) abrirTutorialTorrePestanaSiPrimeraVez();
        }, 520);
      }
    };
    hcWhenDiagramScriptsReady(runSistema);
    return;
  }
  if (tab === 'historial') {
    histDatos = null;
    if (typeof cargarHistorial === 'function') cargarHistorial();
  }
  if (tab === 'consejos' && typeof renderConsejos === 'function') renderConsejos();
  if (tab === 'ayuda') {
    try {
      document.getElementById('tab-ayuda')?.scrollTo(0, 0);
    } catch (_) {}
    try {
      if (typeof refreshAyudaInstalacionUi === 'function') refreshAyudaInstalacionUi();
    } catch (_) {}
  }
  if (tab === 'riego') {
    if (typeof sincronizarInputsRiego === 'function') sincronizarInputsRiego();
    if (typeof initDiaRiego === 'function') initDiaRiego();
    if (typeof actualizarVistaRiegoPorTipoInstalacion === 'function') {
      actualizarVistaRiegoPorTipoInstalacion();
    }
    try {
      if (typeof refreshUbicacionInstalacionUI === 'function') refreshUbicacionInstalacionUI();
    } catch (_) {}
    var riegoNow = Date.now();
    var riegoStale =
      !window._hcRiegoTabCalcAt || riegoNow - window._hcRiegoTabCalcAt > 45000;
    if (typeof calcularRiego === 'function') calcularRiego({ forceRefresh: !!riegoStale });
    window._hcRiegoTabCalcAt = riegoNow;
    window._riegoObsoleto = false;
  }
  try {
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
  } catch (_) {}
  try {
    if (typeof refreshTabsOperativaUi === 'function') {
      refreshTabsOperativaUi({ tab: tab });
    }
  } catch (_) {}
  _hcTabHeavyLast[tab] = Date.now();
}

function goTabDeferredWork(tab, opts) {
  opts = opts || {};
  var gen = _hcGoTabWorkGen;
  goTabDeferredWorkLite(tab);
  if (opts.liteOnly) return;
  var runHeavy = function () {
    goTabDeferredWorkHeavy(tab, gen);
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(runHeavy, { timeout: 2400 });
  } else {
    setTimeout(runHeavy, 32);
  }
}

function goTab(tab) {
  if (tab === currentTab) return;
  const prevTab = currentTab;
  var cfgNav = (typeof state !== 'undefined' && state && state.configTorre) || {};
  if (
    (tab === 'riego' || tab === 'meteo') &&
    typeof medicionesOperativasPermitidas === 'function' &&
    !medicionesOperativasPermitidas()
  ) {
    var meteoProp =
      tab === 'meteo' &&
      typeof hcMeteoTabPermitidaSinOperativa === 'function' &&
      hcMeteoTabPermitidaSinOperativa(cfgNav);
    if (!meteoProp) {
      if (typeof showToast === 'function') {
        showToast(
          tab === 'meteo'
            ? 'Meteo se activa tras el primer llenado del depósito (instalación operativa). En propagador usa Medir e Inicio.'
            : 'Riego se activa tras el primer llenado del depósito (instalación operativa).',
          false,
          { durationMs: 5200 }
        );
      }
      tab = 'inicio';
    }
  }

  if (!_hcTabPanelsCache) {
    _hcTabPanelsCache = Array.prototype.slice.call(document.querySelectorAll('.tab-panel'));
  }
  if (!_hcTabBtnsCache) {
    _hcTabBtnsCache = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
  }
  _hcTabPanelsCache.forEach(function (p) {
    p.classList.remove('active');
    p.setAttribute('aria-hidden', 'true');
  });
  _hcTabBtnsCache.forEach(function (b) {
    b.classList.remove('active');
  });
  const panel = document.getElementById('tab-' + tab);
  if (panel) {
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
  }
  const activeBtn = document.getElementById('btn-' + tab);
  if (activeBtn) activeBtn.classList.add('active');
  scrollTabBarToActive(activeBtn);
  ['inicio','mediciones','sala','sistema','calendario','riego','meteo','historial','consejos','ayuda'].forEach(t => {
    const b = document.getElementById('btn-' + t);
    if (b) b.setAttribute('aria-selected', t === tab ? 'true' : 'false');
  });
  currentTab = tab;
  try {
    actualizarTabContextHints(tab);
  } catch (_) {}

  var tabWork = tab;
  var gen = ++_hcGoTabWorkGen;
  var needsHeavy = hcTabNeedsHeavyRefresh(tabWork);
  if (needsHeavy) _hcTabEverVisited[tabWork] = true;
  requestAnimationFrame(function () {
    if (gen !== _hcGoTabWorkGen) return;
    requestAnimationFrame(function () {
      if (gen !== _hcGoTabWorkGen) return;
      hcScheduleTabPersist(prevTab);
      goTabDeferredWork(tabWork, { liteOnly: !needsHeavy });
    });
  });
}

function irMedirMunicipioClima() {
  const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
  const salaMeteoOculto =
    typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
    hcSalaOcultarPanelesDuplicadosMedir(cfg);
  if (salaMeteoOculto) {
    goTab('meteo');
    return;
  }
  goTab('sala');
  setTimeout(() => {
    const panel = document.getElementById('panelLocalidadMeteo');
    const inp = document.getElementById('inputLocalidadMeteo');
    try {
      panel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) {
      panel?.scrollIntoView();
    }
    try {
      inp?.focus();
    } catch (_) {}
  }, 120);
}

/** Marca el contenedor principal durante scroll para aliviar blur/transiciones (solo desktop). */
function hcInitScrollPerf() {
  var root = document.getElementById('main-content');
  if (!root || root.dataset.scrollPerfBound === '1') return;
  root.dataset.scrollPerfBound = '1';
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  var timer;
  root.addEventListener('scroll', function () {
    if (!root.classList.contains('is-scrolling')) root.classList.add('is-scrolling');
    clearTimeout(timer);
    timer = setTimeout(function () {
      root.classList.remove('is-scrolling');
    }, 120);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', hcInitScrollPerf);

