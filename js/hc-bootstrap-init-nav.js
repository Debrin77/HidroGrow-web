/**
 * resetApp, initApp, reloj, a11y de diálogos, goTab, irMedirMunicipioClima.
 * Tras onboarding; antes de torre-render-build.js / torre-render-main.js (initApp/goTab en runtime).
 */
// ══════════════════════════════════════════════════
// INIT APP
// ══════════════════════════════════════════════════
function resetApp() {
  if (!confirm('⚠️ ¿Estás seguro? Esta acción borrará TODOS los datos guardados en este dispositivo, incluyendo plantas, mediciones y configuración.')) return;
  if (!confirm('⚠️ Segunda confirmación — esta acción NO se puede deshacer. ¿Continuar?')) return;

  try {
    if (typeof hidrogrowLimpiarAlmacenamientoCompleto === 'function') {
      hidrogrowLimpiarAlmacenamientoCompleto();
    }
    if (typeof vaciarFotoDBEnArranque === 'function') {
      void vaciarFotoDBEnArranque();
    }
  } catch (_) {}
  try {
    const _tbc = document.getElementById('hcTabBarCoach');
    if (_tbc) _tbc.classList.add('setup-hidden');
    document.body.classList.remove('hc-tab-coach-open');
  } catch (_) {}

  // Reiniciar estado
  state = initState();
  modoActual = 'vegetativo';
  clEsPrimeraVez = true;
  try {
    delete state.hcPostSetupChecklistPendiente;
  } catch (_) {}
  try {
    delete window._hcPostSetupPrevListo;
  } catch (_) {}
  try {
    delete window._hcChecklistGuidedFlow;
  } catch (_) {}
  try {
    const _clOv = document.getElementById('checklistOverlay');
    if (_clOv) _clOv.classList.remove('checklist-overlay--guided-flow');
  } catch (_) {}

  // Misma base que initApp: slots multi-instalación y datos de la torre activa coherentes
  try {
    if (typeof initTorres === 'function') initTorres();
  } catch (_) {}
  try {
    if (typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario()) {
      if (typeof reconciliarSlotTorreActivaAntesDeCargar === 'function') reconciliarSlotTorreActivaAntesDeCargar();
      if (typeof cargarEstadoTorre === 'function') cargarEstadoTorre(state.torreActiva || 0);
    } else if (typeof hcPrepararEstadoSinInstalacionEnMemoria === 'function') {
      hcPrepararEstadoSinInstalacionEnMemoria();
    }
  } catch (_) {}

  // Actualizar UI
  renderTorre();
  try {
    if (typeof refreshModoInfoText === 'function') refreshModoInfoText();
  } catch (_) {}
  updateTorreStats();
  updateDashboard();
  initConfigUI();
  try {
    if (typeof actualizarHeaderTorre === 'function') actualizarHeaderTorre();
  } catch (_) {}
  try {
    if (typeof aplicarConfigTorre === 'function') aplicarConfigTorre();
  } catch (_) {}
  goTab('inicio');

  // Sin recargar la página: bienvenida / asistente como en el primer arranque
  setTimeout(() => {
    try {
      if (typeof mostrarBienvenidaOContinuarArranque === 'function') mostrarBienvenidaOContinuarArranque();
    } catch (_) {}
  }, 520);
  setTimeout(() => {
    try {
      if (state && state.hcPostSetupChecklistPendiente && typeof actualizarPostSetupChecklistRail === 'function') {
        actualizarPostSetupChecklistRail();
      }
    } catch (_) {}
  }, 1400);

  showToast('🔄 Datos restablecidos · bienvenida y configuración como al abrir la app por primera vez');
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

function hcFinishInitAppHeavyWork() {
  const appEl = document.getElementById('app');
  try {
    if (typeof hcApplyCargarTorreUiPendiente === 'function') hcApplyCargarTorreUiPendiente();
    try {
      renderTorre();
    } catch (eRenderTorre) {
      try {
        console.error('renderTorre en initApp', eRenderTorre);
      } catch (_) {}
    }
    try {
      if (typeof renderTorreMedirDiagram === 'function') renderTorreMedirDiagram();
    } catch (_) {}
    try {
      updateTorreStats();
      updateDashboard();
    } catch (eDash) {
      try {
        console.error('dashboard en initApp', eDash);
      } catch (_) {}
    }
    try {
      initConfigUI();
    } catch (eCfg) {
      try {
        console.error('initConfigUI en initApp', eCfg);
      } catch (_) {}
    }
    try {
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    } catch (_) {}
    try {
      actualizarVistaRiegoPorTipoInstalacion();
    } catch (eHdr) {
      try {
        console.error('riego en initApp', eHdr);
      } catch (_) {}
    }
    try {
      if (
        typeof getCaminoCultivo === 'function' &&
        getCaminoCultivo(state.configTorre || {}) === 'semilla_propagador' &&
        typeof hcSyncGerminacionPlanCultivo === 'function'
      ) {
        hcSyncGerminacionPlanCultivo(state.configTorre);
      }
      if (typeof refreshTabsOperativaCamino === 'function') refreshTabsOperativaCamino();
    } catch (_) {}
    if (typeof refreshDashNotificacionesUI === 'function') refreshDashNotificacionesUI();
  } finally {
    if (appEl) appEl.classList.remove('hc-app-booting');
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
      if (typeof window !== 'undefined' && window._hcPreinitTorreDone) {
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
    }, 2000);
    setTimeout(function () {
      try {
        void refrescarAvisosMeteoalarmEnSegundoPlano();
      } catch (_) {}
    }, 4500);
    setTimeout(function () {
      try {
        actualizarBadgesNutriente();
      } catch (_) {}
    }, 100);
    setTimeout(function () {
      try {
        if (typeof hcScrollAppToTop === 'function') hcScrollAppToTop();
      } catch (_) {}
      try {
        mostrarBienvenidaOContinuarArranque();
      } catch (_) {}
    }, 520);
    setTimeout(function () {
      try {
        if (state && state.hcPostSetupChecklistPendiente && typeof actualizarPostSetupChecklistRail === 'function') {
          actualizarPostSetupChecklistRail();
        }
      } catch (_) {}
    }, 1400);
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
    const instant = typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    btn.scrollIntoView({
      behavior: instant ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  });
}

function goTabDeferredWork(tab) {
  if (tab === 'mediciones') {
    cargarUltimaMedicion();
    if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
    if (typeof refreshMedirTareasHoyBadge === 'function') refreshMedirTareasHoyBadge();
    if (typeof renderMonitorSistemaPanel === 'function') renderMonitorSistemaPanel();
    if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
  }
  if (tab === 'sala') {
    if (typeof salaSubTab === 'function') salaSubTab(window.salaSubActive || 'agua');
    if (typeof hcRefreshSalaTab === 'function') {
      hcRefreshSalaTab({ deferHeavy: true });
    }
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
  }
  if (tab === 'inicio') updateDashboard();
  if (tab === 'meteo') {
    try {
      cargarMeteo();
      window._meteoObsoleto = false;
    } catch (_) {}
  }
  if (tab === 'calendario') { calFecha = new Date(); calDiaSeleccionado = null; renderCalendario(); }
  if (tab === 'sistema') {
    const modoFase =
      typeof hcMostrarSistemaFaseCamino === 'function' && hcMostrarSistemaFaseCamino();
    if (modoFase) {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
      else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
        hcRefreshSistemaPropagadorPanel();
      }
    } else {
      renderTorre();
      if (typeof hcRefreshSistemaCultivoExtras === 'function') hcRefreshSistemaCultivoExtras();
      requestAnimationFrame(() => {
        try {
          const w = document.getElementById('torreSVGWrap');
          if (w && w.querySelector('.torre-loading-placeholder')) renderTorre();
        } catch (_) {}
      });
      renderCompatGrid();
      calcularRotacion();
      const postSetupCultivos =
        typeof state !== 'undefined' && state && state.hcPostSetupChecklistPendiente;
      if (!postSetupCultivos) {
        setTimeout(() => abrirTutorialTorrePestanaSiPrimeraVez(), 520);
      }
    }
  }
  if (tab === 'historial') { histDatos = null; cargarHistorial(); }
  if (tab === 'consejos') renderConsejos();
  if (tab === 'ayuda') {
    try {
      document.getElementById('tab-ayuda')?.scrollTo(0, 0);
    } catch (_) {}
    try {
      if (typeof refreshAyudaInstalacionUi === 'function') refreshAyudaInstalacionUi();
    } catch (_) {}
  }
  if (tab === 'riego') {
    sincronizarInputsRiego();
    initDiaRiego();
    actualizarVistaRiegoPorTipoInstalacion();
    try { refreshUbicacionInstalacionUI(); } catch (_) {}
    var riegoNow = Date.now();
    var riegoStale =
      !window._hcRiegoTabCalcAt || riegoNow - window._hcRiegoTabCalcAt > 45000;
    calcularRiego({ forceRefresh: !!riegoStale });
    window._hcRiegoTabCalcAt = riegoNow;
    window._riegoObsoleto = false;
  }
  if (typeof aplicarEstadoStandbyUI === 'function') aplicarEstadoStandbyUI();
  if (typeof window._hcSyncMainTabTabIndex === 'function') window._hcSyncMainTabTabIndex();
  try {
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
  } catch (_) {}
  requestAnimationFrame(function () {
    try {
      if (typeof refreshTabsOperativaUi === 'function') refreshTabsOperativaUi();
    } catch (_) {}
  });
}

function goTab(tab) {
  if (tab === currentTab) return;
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

  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.remove('active');
    p.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
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
  requestAnimationFrame(function () {
    try {
      guardarEstadoTorreActual();
    } catch (_) {}
    if (typeof hcPersistStateSoon === 'function') hcPersistStateSoon();
    else if (typeof saveState === 'function') saveState();
    goTabDeferredWork(tabWork);
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

