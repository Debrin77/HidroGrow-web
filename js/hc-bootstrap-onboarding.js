/**
 * Bienvenida, guía primeros pasos y hints de pestaña.
 * Tras hc-bootstrap-pin.js; antes de init/nav.
 */
// ══════════════════════════════════════════════════
// ONBOARDING — hints de contexto (PRP) + bienvenida + coach barra de pestañas
// ══════════════════════════════════════════════════
const HC_GUIDE_DISMISS_KEY = 'hc_guia_primer_dia_dismiss';
const HC_ONBOARD_RIEGO_VISIT_KEY = 'hc_onboarding_visit_riego';
const HC_HINT_CTX = { mediciones: 'hc_hint_ctx_med', sala: 'hc_hint_ctx_sala', sistema: 'hc_hint_ctx_sis', riego: 'hc_hint_ctx_riego' };
const HC_BIENVENIDA_KEY = 'hc_bienvenida_v2026_7_camino';
const HC_TAB_BAR_COACH_KEY = 'hc_tab_bar_coach_dismiss_v2';
const HC_WELCOME_THEME_PREVIEW_KEY = 'hc_welcome_theme_preview';

let _tabCoachRetryTimer = null;
/** Posición de scroll del documento antes de fijar body (bienvenida abierta). */
let _hcWelcomeScrollLockY = 0;

/** Fuerza scroll al inicio (PWA / recarga no debe abrir a mitad de página). */
function hcScrollWelcomeOverlayTop() {
  try {
    const ov = document.getElementById('welcomeOverlay');
    if (!ov) return;
    ov.scrollTop = 0;
    ov.scrollLeft = 0;
    const grid = ov.querySelector('.welcome-value-grid');
    if (grid) grid.scrollLeft = 0;
  } catch (_) {}
}

function hcScrollAppToTop() {
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (_) {}
  try {
    window.scrollTo(0, 0);
  } catch (_) {}
  try {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch (_) {}
  hcScrollWelcomeOverlayTop();
}

function hcScrollWelcomeToTopDeferred() {
  hcScrollAppToTop();
  try {
    requestAnimationFrame(() => {
      hcScrollAppToTop();
      requestAnimationFrame(hcScrollAppToTop);
    });
  } catch (_) {
    setTimeout(hcScrollAppToTop, 0);
    setTimeout(hcScrollAppToTop, 80);
  }
}

function _clearTabCoachRetryTimer() {
  if (_tabCoachRetryTimer) {
    try { clearTimeout(_tabCoachRetryTimer); } catch (_) {}
    _tabCoachRetryTimer = null;
  }
}

function initWelcomeValueCarousel() {
  const ov = document.getElementById('welcomeOverlay');
  if (!ov) return;
  const grid = ov.querySelector('.welcome-value-grid');
  const dotsWrap = document.getElementById('welcomeValueDots');
  if (!grid || !dotsWrap) return;
  if (grid.classList.contains('setup-hidden') || grid.getAttribute('aria-hidden') === 'true') {
    dotsWrap.innerHTML = '';
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.welcome-value-card'));
  if (cards.length <= 1) {
    dotsWrap.innerHTML = '';
    return;
  }

  // Crear dots (idempotente)
  if (dotsWrap.children.length !== cards.length) {
    dotsWrap.innerHTML = '';
    cards.forEach((_, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'welcome-dot' + (idx === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', 'Tarjeta ' + (idx + 1) + ' de ' + cards.length);
      b.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      b.setAttribute('role', 'tab');
      b.tabIndex = idx === 0 ? 0 : -1;
      b.addEventListener('click', () => {
        try {
          cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        } catch (_) {
          try { grid.scrollLeft = cards[idx].offsetLeft; } catch (_) {}
        }
      });
      dotsWrap.appendChild(b);
    });
  }

  let raf = 0;
  const update = () => {
    raf = 0;
    try {
      const gRect = grid.getBoundingClientRect();
      const mid = gRect.left + gRect.width / 2;
      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        const cMid = r.left + r.width / 2;
        const d = Math.abs(cMid - mid);
        if (d < bestD) { bestD = d; bestI = i; }
      }
      const dots = Array.from(dotsWrap.children);
      dots.forEach((dEl, i) => {
        const on = i === bestI;
        dEl.classList.toggle('is-active', on);
        dEl.setAttribute('aria-selected', on ? 'true' : 'false');
        dEl.tabIndex = on ? 0 : -1;
      });
    } catch (_) {}
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  if (!grid._hcWelcomeDotsBound) {
    grid._hcWelcomeDotsBound = true;
    grid.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { try { update(); } catch (_) {} }, { passive: true });
  }
  setTimeout(() => { try { update(); } catch (_) {} }, 80);
}

/**
 * Muestra el coach de la barra de pestañas (fase 2) si no se descartó y no hay bienvenida ni asistente encima.
 */
function tryShowTabBarCoachDeferred(attempt) {
  _tabCoachRetryTimer = null;
  const max = 28;
  const n = typeof attempt === 'number' ? attempt : 0;
  let dismissed = false;
  try { dismissed = localStorage.getItem(HC_TAB_BAR_COACH_KEY) === '1'; } catch (_) {}
  if (dismissed) return;
  if (document.body.classList.contains('hc-welcome-open')) {
    if (n < max) _tabCoachRetryTimer = setTimeout(() => tryShowTabBarCoachDeferred(n + 1), 420);
    return;
  }
  const so = document.getElementById('setupOverlay');
  if (so && so.classList.contains('open')) {
    if (n < max) _tabCoachRetryTimer = setTimeout(() => tryShowTabBarCoachDeferred(n + 1), 420);
    return;
  }
  const el = document.getElementById('hcTabBarCoach');
  if (!el) return;
  el.classList.remove('setup-hidden');
  try { document.body.classList.add('hc-tab-coach-open'); } catch (_) {}
}

function hcDebeEvitarReabrirAsistenteTrasSetup() {
  try {
    if (state && state.hcPostSetupChecklistPendiente) return true;
    if (state && state.configTorre && state.configTorre.checklistInstalacionConfirmada === true) {
      const ts = window._hcSetupWizardCompletadoTs;
      if (typeof ts === 'number' && Date.now() - ts < 300000) return true;
    }
    const ts = window._hcSetupWizardCompletadoTs;
    return typeof ts === 'number' && Date.now() - ts < 12000;
  } catch (_) {
    return false;
  }
}

function scheduleTabBarCoach(delayMs) {
  if (typeof hcDebeEvitarReabrirAsistenteTrasSetup === 'function' && hcDebeEvitarReabrirAsistenteTrasSetup()) {
    return;
  }
  let dismissed = false;
  try { dismissed = localStorage.getItem(HC_TAB_BAR_COACH_KEY) === '1'; } catch (_) {}
  if (dismissed) return;
  _clearTabCoachRetryTimer();
  const d = typeof delayMs === 'number' ? delayMs : 900;
  _tabCoachRetryTimer = setTimeout(() => tryShowTabBarCoachDeferred(0), d);
}

/** Primera instalación: aún no hay config guardada (solo plantilla), sin historial de mezcla/medición ni plantas en esquema. */
function hcEsPrimeraVezAsistenteInstalacion() {
  try {
    if (typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario()) {
      return false;
    }
    const cfg = state.configTorre;
    const plantilla = !!(cfg && cfg.hcPlantillaAutogenerada);
    const hayConfig = !!(cfg && !plantilla);
    const hayPlantas =
      typeof getNivelesActivos === 'function' &&
      getNivelesActivos().some(n => state.torre[n] && state.torre[n].some(c => c && c.variedad));
    return !hayConfig && !state.ultimaRecarga && !state.ultimaMedicion && !hayPlantas;
  } catch (_) {
    return false;
  }
}

function dismissTabBarCoach() {
  try { localStorage.setItem(HC_TAB_BAR_COACH_KEY, '1'); } catch (_) {}
  _clearTabCoachRetryTimer();
  const el = document.getElementById('hcTabBarCoach');
  if (el) el.classList.add('setup-hidden');
  try { document.body.classList.remove('hc-tab-coach-open'); } catch (_) {}
  setTimeout(() => {
    try {
      const so = document.getElementById('setupOverlay');
      if (so && so.classList.contains('open')) return;
    } catch (_) {}
    // No forzar de nuevo el asistente si ya hay instalación guardada (p. ej. tras configurar y cerrar flujos).
    try {
      if (typeof hcDebeEvitarReabrirAsistenteTrasSetup === 'function' && hcDebeEvitarReabrirAsistenteTrasSetup()) {
        return;
      }
    } catch (_) {}
    try {
      if (state && state.hcPostSetupChecklistPendiente) return;
    } catch (_) {}
    try {
      if (typeof hcEsPrimeraVezAsistenteInstalacion === 'function' && !hcEsPrimeraVezAsistenteInstalacion()) {
        return;
      }
    } catch (_) {}
    if (typeof abrirSetup === 'function') abrirSetup();
  }, 450);
}

function welcomeCarouselSkip() {
  cerrarBienvenidaPrimeraVez();
}

function welcomeEmpezar() {
  cerrarBienvenidaPrimeraVez();
  try {
    if (typeof goTab === 'function') goTab('inicio');
  } catch (_) {}
}

function welcomeAbrirSetup() {
  cerrarBienvenidaPrimeraVez({ skipLanzarSetup: true });
  try {
    setTimeout(function () {
      if (typeof abrirSetup === 'function') abrirSetup();
    }, 450);
  } catch (_) {}
}

function setWelcomeTheme(theme) {
  const ov = document.getElementById('welcomeOverlay');
  if (!ov) return;
  const t = theme === 'dark' ? 'dark' : 'light';
  ov.setAttribute('data-welcome-theme', t);
  const lightBtn = document.getElementById('welcomeThemeBtnLight');
  const darkBtn = document.getElementById('welcomeThemeBtnDark');
  if (lightBtn) {
    const on = t === 'light';
    lightBtn.classList.toggle('is-active', on);
    lightBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if (darkBtn) {
    const on = t === 'dark';
    darkBtn.classList.toggle('is-active', on);
    darkBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  try { localStorage.setItem(HC_WELCOME_THEME_PREVIEW_KEY, t); } catch (_) {}
}

function applyWelcomeScrollLock(open) {
  try {
    document.documentElement.classList.toggle('hc-welcome-open', !!open);
    if (open) {
      hcScrollWelcomeToTopDeferred();
      setTimeout(hcScrollWelcomeOverlayTop, 120);
      setTimeout(hcScrollWelcomeOverlayTop, 480);
      _hcWelcomeScrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = _hcWelcomeScrollLockY ? '-' + _hcWelcomeScrollLockY + 'px' : '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.overscrollBehavior = 'none';
    } else {
      const restoreY = _hcWelcomeScrollLockY || 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
      _hcWelcomeScrollLockY = 0;
      try {
        window.scrollTo(0, restoreY);
      } catch (_) {}
    }
  } catch (_) {}
}

function resetBienvenidaParaPruebas() {
  try { localStorage.removeItem(HC_BIENVENIDA_KEY); } catch (_) {}
  try {
    const ov = document.getElementById('welcomeOverlay');
    if (!ov) {
      if (typeof showToast === 'function') showToast('No se encontró la bienvenida', true);
      return;
    }
    if (!ov.classList.contains('setup-hidden')) {
      if (typeof showToast === 'function') showToast('La bienvenida ya está abierta');
      return;
    }
    // Apertura forzada para pruebas en móvil: evita bloqueos por reglas de "ya hay datos".
    ov.classList.remove('setup-hidden');
    ov.setAttribute('aria-hidden', 'false');
    hcScrollWelcomeToTopDeferred();
    try {
      const tSaved = localStorage.getItem(HC_WELCOME_THEME_PREVIEW_KEY);
      setWelcomeTheme(tSaved === 'dark' ? 'dark' : 'light');
    } catch (_) {
      setWelcomeTheme('light');
    }
    try { document.body.classList.add('hc-welcome-open'); } catch (_) {}
    applyWelcomeScrollLock(true);
    try { initWelcomeValueCarousel(); } catch (_) {}
    try { document.addEventListener('keydown', _welcomeGuideOnKeydown); } catch (_) {}
    try {
      const nb = document.getElementById('welcomeBtnEmpezar');
      if (nb && typeof nb.focus === 'function') setTimeout(() => nb.focus(), 50);
    } catch (_) {}
    const abierta = !ov.classList.contains('setup-hidden');
    if (typeof showToast === 'function') {
      showToast(abierta ? 'Guia de bienvenida reabierta' : 'No se pudo reabrir la bienvenida', !abierta);
    }
  } catch (_) {
    if (typeof showToast === 'function') showToast('No se pudo reabrir la bienvenida', true);
  }
}

/**
 * Si ya hay cultivo / mediciones / registro guardados, no forzar la bienvenida:
 * evita bloquear la app cuando falta la clave en localStorage (cambio de navegador, borrado parcial, etc.).
 * No usamos solo `configTorre` con claves: en arranque puede existir un borrador mínimo sin ser “usuario ya configurado”.
 */
function _medicionObjetoTieneDatosReales(u) {
  if (!u || typeof u !== 'object') return false;
  if (String(u.fecha || '').trim()) return true;
  const ec = u.ec;
  const ph = u.ph;
  const vol = u.vol;
  const temp = u.temp;
  const n = v => v != null && v !== '' && Number.isFinite(Number(v));
  if (n(ec) && Number(ec) > 50) return true;
  if (n(ph) && Number(ph) >= 3 && Number(ph) <= 10) return true;
  if (n(vol) && Number(vol) > 0) return true;
  if (n(temp)) return true;
  return false;
}

function hayDatosHidrocultivoRelevantes() {
  try {
    if (!state || typeof state !== 'object') return false;
    const plantilla = !!(state.configTorre && state.configTorre.hcPlantillaAutogenerada);
    if (!plantilla) {
      if (Array.isArray(state.mediciones) && state.mediciones.length > 0) return true;
      if (Array.isArray(state.registro) && state.registro.length > 0) return true;
    }
    if (state.ultimaMedicion && typeof state.ultimaMedicion === 'object') {
      if (_medicionObjetoTieneDatosReales(state.ultimaMedicion)) return true;
    }
    if (state.ultimaRecarga && typeof state.ultimaRecarga === 'object') {
      const r = state.ultimaRecarga;
      if (String(r.fecha || '').trim()) return true;
      if (r.volumen != null && r.volumen !== '' && Number.isFinite(Number(r.volumen)) && Number(r.volumen) > 0) return true;
    }
    if (typeof initTorres === 'function') {
      try { initTorres(); } catch (_) {}
    }
    if (Array.isArray(state.torres)) {
      for (let i = 0; i < state.torres.length; i++) {
        const tor = state.torres[i];
        if (!tor || typeof tor !== 'object') continue;
        if (Array.isArray(tor.mediciones) && tor.mediciones.length) return true;
        if (Array.isArray(tor.registro) && tor.registro.length) return true;
      }
    }
    if (typeof getNivelesActivos === 'function' && state.torre) {
      const nivs = getNivelesActivos();
      for (let ni = 0; ni < nivs.length; ni++) {
        const row = state.torre[nivs[ni]];
        if (row && row.some(c => c && String(c.variedad || '').trim())) return true;
      }
    }
  } catch (_) {}
  return false;
}

function _welcomeGuideOnKeydown(e) {
  if (!document.body.classList.contains('hc-welcome-open')) return;
  if (e.key === 'Escape') {
    welcomeCarouselSkip();
    e.preventDefault();
  }
}

function tabBarCoachYaDescartado() {
  try {
    return localStorage.getItem(HC_TAB_BAR_COACH_KEY) === '1';
  } catch (_) {
    return true;
  }
}

function lanzarSetupOChecklistSiCorresponde() {
  if (!hcEsPrimeraVezAsistenteInstalacion()) return;
  try {
    if (typeof hcDebeEvitarReabrirAsistenteTrasSetup === 'function' && hcDebeEvitarReabrirAsistenteTrasSetup()) {
      return;
    }
  } catch (_) {}
  try {
    if (state && state.hcPostSetupChecklistPendiente) return;
  } catch (_) {}
  // Tras la bienvenida: primero el coach de la barra («Entendido»); al cerrarlo se abre el asistente (ver dismissTabBarCoach).
  if (tabBarCoachYaDescartado()) {
    setTimeout(() => {
      try {
        const so = document.getElementById('setupOverlay');
        if (so && so.classList.contains('open')) return;
      } catch (_) {}
      if (typeof hcDebeEvitarReabrirAsistenteTrasSetup === 'function' && hcDebeEvitarReabrirAsistenteTrasSetup()) return;
      if (typeof abrirSetup === 'function') abrirSetup();
    }, 450);
  }
  // No abrir el checklist automáticamente en cada arranque.
}

function mostrarBienvenidaOContinuarArranque(opts) {
  const forceShow = !!(opts && opts.forceShow);
  let visto = false;
  try { visto = localStorage.getItem(HC_BIENVENIDA_KEY) === '1'; } catch (_) {}
  if (visto && !forceShow) {
    lanzarSetupOChecklistSiCorresponde();
    scheduleTabBarCoach(1100);
    return;
  }
  if (!forceShow && hayDatosHidrocultivoRelevantes()) {
    try { localStorage.setItem(HC_BIENVENIDA_KEY, '1'); } catch (_) {}
    lanzarSetupOChecklistSiCorresponde();
    scheduleTabBarCoach(1100);
    return;
  }
  const ov = document.getElementById('welcomeOverlay');
  if (ov) {
    hcScrollAppToTop();
    ov.classList.remove('setup-hidden');
    ov.setAttribute('aria-hidden', 'false');
    try { document.body.classList.add('hc-welcome-open'); } catch (_) {}
    applyWelcomeScrollLock(true);
    try { initWelcomeValueCarousel(); } catch (_) {}
    try {
      const tSaved = localStorage.getItem(HC_WELCOME_THEME_PREVIEW_KEY);
      setWelcomeTheme(tSaved === 'dark' ? 'dark' : 'light');
    } catch (_) {
      setWelcomeTheme('light');
    }
    try { document.addEventListener('keydown', _welcomeGuideOnKeydown); } catch (_) {}
    try {
      const nb = document.getElementById('welcomeBtnEmpezar');
      if (nb && typeof nb.focus === 'function') setTimeout(() => nb.focus(), 50);
    } catch (_) {}
    return;
  }
  lanzarSetupOChecklistSiCorresponde();
}

/**
 * @param {{ skipLanzarSetup?: boolean }} [opts] — si el usuario elige abrir el asistente desde la guía, evitar doble `abrirSetup`.
 */
function cerrarBienvenidaPrimeraVez(opts) {
  const chk = document.getElementById('welcomeChkNoMas');
  const recordarCerrar = !chk || chk.checked;
  if (recordarCerrar) {
    try { localStorage.setItem(HC_BIENVENIDA_KEY, '1'); } catch (_) {}
  }
  const ov = document.getElementById('welcomeOverlay');
  if (ov) {
    ov.classList.add('setup-hidden');
    ov.setAttribute('aria-hidden', 'true');
  }
  try { document.body.classList.remove('hc-welcome-open'); } catch (_) {}
  applyWelcomeScrollLock(false);
  try { document.removeEventListener('keydown', _welcomeGuideOnKeydown); } catch (_) {}
  if (!opts || !opts.skipLanzarSetup) {
    lanzarSetupOChecklistSiCorresponde();
  }
  scheduleTabBarCoach(1300);
}

function dismissTabContextHint(which) {
  const k = HC_HINT_CTX[which];
  if (k) {
    try { localStorage.setItem(k, '1'); } catch (_) {}
  }
  const id = which === 'mediciones' ? 'tabContextHintMediciones'
    : which === 'sala' ? 'tabContextHintSala'
    : which === 'sistema' ? 'tabContextHintSistema'
    : which === 'riego' ? 'tabContextHintRiego' : null;
  const el = id ? document.getElementById(id) : null;
  if (el) el.classList.add('setup-hidden');
}

function actualizarTabContextHints(tab) {
  const map = {
    mediciones: 'tabContextHintMediciones',
    sala: 'tabContextHintSala',
    sistema: 'tabContextHintSistema',
    riego: 'tabContextHintRiego',
  };
  const id = map[tab];
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const key = HC_HINT_CTX[tab];
  let seen = false;
  try { seen = key && localStorage.getItem(key) === '1'; } catch (_) {}
  if (seen) el.classList.add('setup-hidden');
  else el.classList.remove('setup-hidden');
}

function actualizarQuickActionsNoviceMode() {
  const wrap = document.getElementById('quickActionsWrap');
  const more = document.getElementById('quickActionsMore');
  if (!wrap || !more) return;
  const exp = !!(state && state.configTorre && state.ultimaMedicion);
  wrap.classList.toggle('quick-actions-wrap--experienced', exp);
  more.open = exp;
}

// ══════════════════════════════════════════════════
// Tras el asistente: Sistema (cultivos) → oferta de checklist
// ══════════════════════════════════════════════════

/** El rail va debajo del título de la pestaña activa (Sala, Cultivo o Inicio). */
function hcMountPostSetupChecklistRailInActiveTab() {
  const rail = document.getElementById('hcPostSetupChecklistRail');
  if (!rail) return;
  const tabId =
    typeof currentTab !== 'undefined' && (currentTab === 'sala' || currentTab === 'sistema' || currentTab === 'inicio')
      ? 'tab-' + currentTab
      : 'tab-sistema';
  const tab = document.getElementById(tabId);
  if (!tab) return;
  const h1 = tab.querySelector('h1.section-title');
  const anchor = h1 || tab.firstElementChild;
  if (anchor && rail.previousElementSibling !== anchor) {
    anchor.insertAdjacentElement('afterend', rail);
  } else if (rail.parentNode !== tab) {
    tab.insertBefore(rail, tab.firstChild);
  }
}

function hcMountPostSetupChecklistRailInTabSistema() {
  hcMountPostSetupChecklistRailInActiveTab();
}

function ensurePostSetupChecklistRail() {
  let el = document.getElementById('hcPostSetupChecklistRail');
  if (el) {
    hcMountPostSetupChecklistRailInTabSistema();
    return el;
  }
  el = document.createElement('div');
  el.id = 'hcPostSetupChecklistRail';
  el.className = 'hc-post-setup-rail setup-hidden';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'Siguiente paso de instalación');
  el.innerHTML =
    '<div class="hc-post-setup-rail-inner">' +
      '<div class="hc-post-setup-rail-track" id="hcPostSetupRailTrack" aria-hidden="true">' +
        '<span class="hc-post-setup-rail-chip hc-post-setup-rail-chip--done" data-step="config">1 · Instalación</span>' +
        '<span class="hc-post-setup-rail-arrow" aria-hidden="true">→</span>' +
        '<span class="hc-post-setup-rail-chip hc-post-setup-rail-chip--next" data-step="montaje">2 · Montaje</span>' +
        '<span class="hc-post-setup-rail-arrow" aria-hidden="true">→</span>' +
        '<span class="hc-post-setup-rail-chip hc-post-setup-rail-chip--next" data-step="cultivo">3 · Cultivo</span>' +
        '<span class="hc-post-setup-rail-arrow" aria-hidden="true">→</span>' +
        '<span class="hc-post-setup-rail-chip hc-post-setup-rail-chip--next" data-step="deposito">4 · Depósito</span>' +
      '</div>' +
      '<div class="hc-post-setup-rail-title" id="hcPostSetupRailTitle">Montaje de sala</div>' +
      '<p class="hc-post-setup-rail-text" id="hcPostSetupRailText">' +
        'Sigue el orden: propagador → sala → montaje → 6 fases → DWC/RDWC → depósito.' +
      '</p>' +
      '<p class="hc-post-setup-rail-status setup-hidden" id="hcPostSetupRailStatus" role="status"></p>' +
      '<div class="hc-post-setup-rail-actions">' +
        '<button type="button" class="btn btn-primary hc-post-setup-rail-btn-main" id="hcPostSetupBtnChecklist">' +
          'Ir a montaje' +
        '</button>' +
        '<button type="button" class="btn btn-ghost hc-post-setup-rail-btn-later" id="hcPostSetupBtnLater">' +
          'Más tarde' +
        '</button>' +
      '</div>' +
    '</div>';
  const tabSistema = document.getElementById('tab-sistema');
  const h1Sistema = tabSistema && tabSistema.querySelector('h1.section-title');
  if (h1Sistema) {
    h1Sistema.insertAdjacentElement('afterend', el);
  } else if (tabSistema) {
    tabSistema.insertBefore(el, tabSistema.firstChild);
  } else {
    document.body.appendChild(el);
  }
  hcMountPostSetupChecklistRailInTabSistema();
  const b1 = document.getElementById('hcPostSetupBtnChecklist');
  const b2 = document.getElementById('hcPostSetupBtnLater');
  if (b1) b1.addEventListener('click', () => hcAccionInstalacionGuidadaDesdeRail());
  if (b2) b2.addEventListener('click', () => hcPostSetupChecklistMasTarde());
  return el;
}

function actualizarPostSetupChecklistRail() {
  const el = document.getElementById('hcPostSetupChecklistRail');
  const guidada =
    typeof instalacionGuidadaActiva === 'function' ? instalacionGuidadaActiva() : !!(state && state.hcPostSetupChecklistPendiente);
  if (!state || !guidada) {
    if (el) el.classList.add('setup-hidden');
    return;
  }
  const lc = typeof getInstalacionLifecycle === 'function' ? getInstalacionLifecycle() : null;
  if (lc && lc.operativaDiaria) {
    if (el) el.classList.add('setup-hidden');
    return;
  }
  const tabOk =
    typeof currentTab !== 'undefined' &&
    (currentTab === 'sistema' || currentTab === 'sala' || currentTab === 'inicio');
  if (!tabOk) {
    if (el) el.classList.add('setup-hidden');
    return;
  }
  ensurePostSetupChecklistRail();
  hcMountPostSetupChecklistRailInActiveTab();
  const rail = document.getElementById('hcPostSetupChecklistRail');
  if (!rail) return;
  rail.classList.remove('setup-hidden');

  const fase = lc ? lc.fase : 'montaje_pendiente';
  const track = document.getElementById('hcPostSetupRailTrack');
  if (track) {
    const chips = track.querySelectorAll('.hc-post-setup-rail-chip');
    chips.forEach((chip) => {
      const step = chip.getAttribute('data-step');
      chip.classList.remove('hc-post-setup-rail-chip--done', 'hc-post-setup-rail-chip--active', 'hc-post-setup-rail-chip--next');
      const order = ['config', 'montaje', 'cultivo', 'deposito'];
      const idx = order.indexOf(step);
      const paso = lc && lc.pasos ? lc.pasos[idx] : null;
      if (paso && paso.done) chip.classList.add('hc-post-setup-rail-chip--done');
      else if (paso && paso.current) chip.classList.add('hc-post-setup-rail-chip--active');
      else chip.classList.add('hc-post-setup-rail-chip--next');
    });
  }

  const titleEl = document.getElementById('hcPostSetupRailTitle');
  const textEl = document.getElementById('hcPostSetupRailText');
  const st = document.getElementById('hcPostSetupRailStatus');
  const btn = document.getElementById('hcPostSetupBtnChecklist');

  let title = 'Montaje de sala';
  let text = 'Completa el checklist de <strong>montaje</strong> en Sala.';
  let btnLabel = 'Ir a montaje';
  let statusTxt = '';
  let btnDisabled = false;
  let railAction = '';

  const cfg = state.configTorre || {};
  const cam =
    typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : cfg.caminoCultivo || '';
  const pasoUnico =
    typeof hcSiguientePasoInstalacion === 'function'
      ? hcSiguientePasoInstalacion(cfg, fase)
      : null;
  const railGuiado = {
    propagador: {
      title: cam === 'semilla_hidro' ? 'Paso 1 · Prep en hidro' : 'Paso 1 · Propagador',
      text:
        'Checklist del ' +
        (cam === 'semilla_hidro' ? '<strong>prep en hidro</strong>' : '<strong>propagador/domo</strong>') +
        ' antes de configurar la sala.',
    },
    sala_config: {
      title: 'Paso 2 · Configurar sala',
      text:
        'Asistente: carpa, LED, extractor y ubicación. <strong>Sin DWC/RDWC</strong> todavía — eso va tras las 6 fases.',
    },
    sala_montaje: {
      title: 'Paso 3 · Montaje de sala',
      text:
        'Checklist físico en Sala (carpa, luz, aire). Los puntos del <strong>sistema hidro</strong> aparecen después del asistente DWC/RDWC.',
    },
    germinacion: {
      title: 'Paso 4 · Germinación (6 fases)',
      text:
        'Control día a día en <strong>Inicio</strong>. Incluye checklist de traslado antes del depósito.',
    },
    hidro_config: {
      title: 'Paso 5 · Sistema DWC/RDWC',
      text:
        cam === 'semilla_hidro'
          ? 'Cierra el asistente hidro. La germinación en el depósito <strong>ya está hecha</strong>.'
          : 'Configura DWC/RDWC y circuito; luego puntos hidro en montaje de sala.',
    },
    enraizado: {
      title: 'Enraizado de esquejes',
      text:
        'Checklist de domo, rockwool e higiene antes de asignar clones y el primer llenado del depósito.',
    },
    montaje_hidro: {
      title: 'Montaje · sistema hidro',
      text: 'Completa tuberías, aireación y puntos de sistema en el checklist de Sala.',
    },
  };

  if (pasoUnico && railGuiado[pasoUnico.etapa]) {
    title = railGuiado[pasoUnico.etapa].title;
    text = railGuiado[pasoUnico.etapa].text;
    btnLabel = pasoUnico.label;
    railAction = pasoUnico.action;
    if (pasoUnico.etapa === 'germinacion') {
      try {
        const g = cfg.germinacionFlow;
        const pasos = g && g.pasos ? g.pasos : {};
        const ids = ['semilla', 'taproot', 'rockwool', 'domo', 'netpot', 'dwc'];
        let done = 0;
        ids.forEach((id) => {
          if (pasos[id] && pasos[id].doneAt) done++;
        });
        statusTxt = 'Camino: ' + done + '/6 fases · traslado: ' + (g && g.checklistTrasladoOk ? '✓' : 'pendiente');
      } catch (_) {}
    }
  }

  const germCamino = cam === 'semilla_propagador' || cam === 'semilla_hidro';
  const germAct =
    typeof hcGerminacionActiva === 'function' ? hcGerminacionActiva(cfg) : false;

  if (fase === 'cultivo_pendiente' && !(pasoUnico && railGuiado[pasoUnico.etapa])) {
    title = 'Cultivo en el esquema';
    text =
      'Asigna <strong>variedad</strong> y <strong>fecha</strong> en cada cesta con planta.';
    btnLabel = 'Asignar cultivos';
    const sinVariedad =
      typeof torreTieneAlgunaVariedadAsignada === 'function' && !torreTieneAlgunaVariedadAsignada();
    const bloqueado =
      typeof torreBloqueaChecklistPorFaltaDatosCultivo === 'function' &&
      torreBloqueaChecklistPorFaltaDatosCultivo();
    if (sinVariedad) {
      statusTxt = 'Elige cultivo arriba y tócalo en cada cesta del esquema.';
    } else if (bloqueado) {
      statusTxt = 'Revisa fechas u origen en las cestas con cultivo.';
    }
  } else if (fase === 'deposito_pendiente' && !(pasoUnico && railGuiado[pasoUnico.etapa])) {
    title = 'Checklist del depósito (nutrientes)';
    text =
      'Abre el <strong>checklist del depósito</strong> para el primer llenado.';
    btnLabel = 'Checklist depósito';
    const bloqueado =
      typeof torreBloqueaChecklistPorFaltaDatosCultivo === 'function' &&
      torreBloqueaChecklistPorFaltaDatosCultivo();
    const sinVariedad =
      typeof torreTieneAlgunaVariedadAsignada === 'function' && !torreTieneAlgunaVariedadAsignada();
    btnDisabled = !!(bloqueado || sinVariedad);
    if (btnDisabled) {
      statusTxt = sinVariedad
        ? 'Falta al menos un cultivo en el esquema.'
        : 'Completa fechas de trasplante antes del checklist.';
    }
  } else if (fase === 'montaje_pendiente' && !railAction) {
    const checks = cfg.puestaMarchaChecks || {};
    if (checks.completedAt) {
      statusTxt = '';
    } else if (typeof hcBuildPuestaMarchaItems === 'function') {
      try {
        const items = hcBuildPuestaMarchaItems(cfg);
        const done = items.filter((it) => checks[it.id]).length;
        statusTxt = done > 0 ? 'Montaje: ' + done + '/' + items.length + ' puntos marcados.' : '';
      } catch (_) {}
    }
  }

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.innerHTML = text;
  if (st) {
    if (statusTxt) {
      st.textContent = statusTxt;
      st.classList.remove('setup-hidden');
    } else {
      st.textContent = '';
      st.classList.add('setup-hidden');
    }
  }
  if (btn) {
    btn.textContent = btnLabel;
    btn.disabled = !!btnDisabled;
    btn.setAttribute('aria-disabled', btnDisabled ? 'true' : 'false');
    if (railAction) btn.dataset.railAction = railAction;
    else delete btn.dataset.railAction;
  }
  try {
    if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
  } catch (_) {}
}

/** Tras el asistente: al menos un cultivo y sin bloqueo de checklist (en automático: fechas/origen; en manual: siempre listo). */
function _hcPostSetupListoParaChecklistGuiado() {
  try {
    if (!state || !state.hcPostSetupChecklistPendiente) return false;
    if (typeof torreTieneAlgunaVariedadAsignada !== 'function' || !torreTieneAlgunaVariedadAsignada()) return false;
    if (typeof torreBloqueaChecklistPorFaltaDatosCultivo === 'function' && torreBloqueaChecklistPorFaltaDatosCultivo()) return false;
    return true;
  } catch (_) {
    return false;
  }
}

function hcNotificarCambioCultivoSistema() {
  try {
    if (!state || !state.hcPostSetupChecklistPendiente) {
      try {
        delete window._hcPostSetupPrevListo;
      } catch (_) {}
      if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
      return;
    }
    const listo = _hcPostSetupListoParaChecklistGuiado();
    let prevListo = false;
    try {
      prevListo = window._hcPostSetupPrevListo === true;
    } catch (_) {}
    try {
      window._hcPostSetupPrevListo = listo;
    } catch (_) {}
    const transicion = listo && !prevListo;
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    if (transicion && typeof showToast === 'function') {
      const lc = typeof getInstalacionLifecycle === 'function' ? getInstalacionLifecycle() : null;
      if (lc && lc.fase === 'deposito_pendiente') {
        showToast('Cultivos listos: abre el checklist del depósito cuando quieras mezclar nutrientes.');
      } else {
        showToast('Cultivos listos en el esquema. Sigue con el checklist del depósito cuando toque.');
      }
    }
  } catch (_) {}
}

/** Tras el asistente: preselecciona una variedad del grupo elegido en el paso Cultivos. */
function hcPreseleccionarVariedadAssignPostSetup() {
  try {
    const sel = document.getElementById('torreAssignVariedad');
    if (!sel || typeof CULTIVOS_DB === 'undefined') return;
    const cfg = state.configTorre || {};
    const grupo =
      typeof hcGrupoCultivoDominanteDesdeConfig === 'function'
        ? hcGrupoCultivoDominanteDesdeConfig(cfg)
        : Array.isArray(cfg.cultivosIniciales) && cfg.cultivosIniciales[0]
          ? cfg.cultivosIniciales[0]
          : '';
    if (!grupo) return;
    const cult = CULTIVOS_DB.find(c => String(c.grupo || '').toLowerCase() === String(grupo).toLowerCase());
    if (cult && cult.nombre) sel.value = cult.nombre;
  } catch (_) {}
}

/** Pregunta checklist ahora / más tarde tras asignar cultivos (flujo post-asistente). */
function hcPreguntarChecklistPostSetupSiListo() {
  try {
    if (!state || !state.hcPostSetupChecklistPendiente) return;
    if (window._hcPostSetupChecklistPreguntaMostrada) return;
    if (typeof _hcPostSetupListoParaChecklistGuiado !== 'function' || !_hcPostSetupListoParaChecklistGuiado()) return;
    if (document.getElementById('checklistPreguntaOverlay')) return;
    window._hcPostSetupChecklistPreguntaMostrada = true;
    if (typeof preguntarIniciarChecklist === 'function') {
      preguntarIniciarChecklist();
    }
  } catch (_) {}
}

function hcEjecutarChecklistPostSetupTrasCultivosListos() {
  try {
    window._hcChecklistGuidedFlow = true;
  } catch (_) {}
  try {
    delete window._hcPostSetupPrevListo;
  } catch (_) {}
  try {
    delete state.hcPostSetupChecklistPendiente;
    if (typeof saveState === 'function') saveState();
  } catch (_) {}
  actualizarPostSetupChecklistRail();
  try {
    if (typeof goTab === 'function') goTab('inicio');
  } catch (_) {}
  setTimeout(() => {
    try {
      if (typeof preguntarIniciarChecklist === 'function') preguntarIniciarChecklist();
    } catch (e) {
      console.error(e);
    }
  }, 280);
}

function hcPostSetupChecklistMasTarde() {
  try {
    delete window._hcPostSetupPrevListo;
  } catch (_) {}
  try {
    delete window._hcChecklistGuidedFlow;
  } catch (_) {}
  try {
    state.hcInstalacionGuidadaDismissed = true;
    delete state.hcPostSetupChecklistPendiente;
    if (typeof saveState === 'function') saveState();
  } catch (_) {}
  actualizarPostSetupChecklistRail();
  if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
  if (typeof showToast === 'function') {
    showToast('Instalación en Inicio: sigue el progreso cuando quieras.');
  }
}

function hcAccionInstalacionGuidadaDesdeRail() {
  const btn = document.getElementById('hcPostSetupBtnChecklist');
  const act = btn && btn.dataset ? btn.dataset.railAction : '';
  if (act && typeof hcEjecutarAccionInstalacion === 'function') {
    hcEjecutarAccionInstalacion(act);
    return;
  }
  const lc = typeof getInstalacionLifecycle === 'function' ? getInstalacionLifecycle() : null;
  const fase = lc ? lc.fase : 'montaje_pendiente';
  if (fase === 'montaje_pendiente') {
    if (typeof hcIrMontajeSala === 'function') hcIrMontajeSala();
    return;
  }
  if (fase === 'cultivo_pendiente') {
    if (typeof hcIrCultivoMatriz === 'function') hcIrCultivoMatriz(true);
    return;
  }
  if (fase === 'deposito_pendiente') {
    hcAccionChecklistPostSetupDesdeSistema();
    return;
  }
  if (typeof hcIrMontajeSala === 'function') hcIrMontajeSala();
}

function hcAccionChecklistPostSetupDesdeSistema() {
  if (typeof hcGateChecklistDeposito === 'function' && !hcGateChecklistDeposito({ desdePostSetupRail: true })) {
    actualizarPostSetupChecklistRail();
    return;
  }
  if (typeof torreTieneAlgunaVariedadAsignada === 'function' && !torreTieneAlgunaVariedadAsignada()) {
    if (typeof showToast === 'function') {
      showToast('Indica al menos un cultivo en el esquema antes del checklist.', true);
    }
    actualizarPostSetupChecklistRail();
    return;
  }
  if (
    typeof torreBloqueaChecklistPorFaltaDatosCultivo === 'function' &&
    torreBloqueaChecklistPorFaltaDatosCultivo()
  ) {
    if (typeof mostrarChecklistBloqueadoCultivoSistema === 'function') {
      mostrarChecklistBloqueadoCultivoSistema({ desdeWizard: true, desdePostSetupRail: true });
    } else if (typeof showToast === 'function') {
      showToast('Completa variedad y fecha en las cestas con planta (Cultivo e instalación).', true);
    }
    actualizarPostSetupChecklistRail();
    return;
  }
  hcEjecutarChecklistPostSetupTrasCultivosListos();
}

try {
  window.addEventListener(
    'pageshow',
    function (ev) {
      try {
        if (ev.persisted || document.body.classList.contains('hc-welcome-open')) {
          hcScrollWelcomeToTopDeferred();
        }
      } catch (_) {}
    },
    { passive: true }
  );
} catch (_) {}

function iniciarFlujoSistemaAntesChecklistPostSetup() {
  if (typeof iniciarFlujoInstalacionPostSetup === 'function') {
    iniciarFlujoInstalacionPostSetup();
    return;
  }
  try {
    if (typeof goTab === 'function') goTab('sistema');
  } catch (_) {}
  setTimeout(() => {
    ensurePostSetupChecklistRail();
    actualizarPostSetupChecklistRail();
    try {
      if (typeof setTorreInteraccionModo === 'function') {
        setTorreInteraccionModo('asignar', { skipTutorial: true, desdePostSetup: true });
      }
    } catch (_) {}
    try {
      if (typeof hcPreseleccionarVariedadAssignPostSetup === 'function') {
        hcPreseleccionarVariedadAssignPostSetup();
      }
    } catch (_) {}
    try {
      if (typeof hcNotificarCambioCultivoSistema === 'function') hcNotificarCambioCultivoSistema();
    } catch (_) {}
    try {
      const torreWrap = document.querySelector('#tab-sistema .torre-container');
      if (torreWrap && typeof torreWrap.scrollIntoView === 'function') {
        torreWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (_) {}
    const assignPanel = document.getElementById('torreAssignPanel');
    if (assignPanel && typeof assignPanel.scrollIntoView === 'function') {
      assignPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 120);
}

