/**
 * PIN, sesión y desbloqueo (initApp se invoca en runtime tras cargar init-nav).
 * Tras hc-bootstrap-state.js; antes de onboarding.
 */
// ══════════════════════════════════════════════════
// PIN
// ══════════════════════════════════════════════════
let pinEntry = '';
let appBootstrapped = false;
/** Evita que lockAppWithPin pise un desbloqueo en curso. */
let appUnlockInProgress = false;

function getAuthRememberMinutes() {
  try {
    const raw = localStorage.getItem(AUTH_REMEMBER_MIN_KEY);
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  } catch (_) {
    return 0;
  }
}

function onAuthRememberChange(v) {
  const n = Math.max(0, Number(v) || 0);
  try {
    localStorage.setItem(AUTH_REMEMBER_MIN_KEY, String(n));
    if (n === 0) localStorage.removeItem(AUTH_TS_KEY);
  } catch (_) {}
  showToast(n === 0 ? 'Autenticación: siempre al abrir' : `Autenticación: recordar ${n} min`);
}

function forzarReautenticacion() {
  try {
    localStorage.removeItem(AUTH_TS_KEY);
  } catch (_) {}
  showToast('Sesión cerrada. Vuelve a autenticarte.');
  setTimeout(() => location.reload(), 250);
}

function toggleSeguridadAccesoInicio() {
  const p = document.getElementById('panelSeguridadAccesoInicio');
  const b = document.getElementById('btnSeguridadAccesoInicio');
  if (!p || !b) return;
  p.classList.toggle('setup-hidden');
  const isOpen = !p.classList.contains('setup-hidden');
  b.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  p.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  if (isOpen && typeof window.syncHcAppearanceUi === 'function') window.syncHcAppearanceUi();
}

function toggleAvisosTelefonoInicio() {
  const p = document.getElementById('panelNotifPrefsInicio');
  const b = document.getElementById('btnNotifPrefsInicio');
  if (!p || !b) return;
  const expanded = b.getAttribute('aria-expanded') !== 'false';
  p.hidden = expanded;
  b.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  try {
    if (typeof ensureNotifOpciones === 'function') ensureNotifOpciones();
    if (state && state.notifOpciones) {
      state.notifOpciones.panelInicioColapsado = !!expanded;
      if (typeof saveState === 'function') saveState();
    }
  } catch (_) {}
}

function hasValidAuthSession() {
  try {
    const rememberMin = getAuthRememberMinutes();
    if (rememberMin <= 0) return false;
    const authTs = Number(localStorage.getItem(AUTH_TS_KEY) || 0);
    if (!Number.isFinite(authTs) || authTs <= 0) return false;
    const maxAge = rememberMin * 60 * 1000;
    return (Date.now() - authTs) < maxAge;
  } catch (_) {
    return false;
  }
}

function unlockAndInitApp() {
  if (appBootstrapped || appUnlockInProgress) return;
  appUnlockInProgress = true;
  const pinEl = document.getElementById('pinScreen');
  const appEl = document.getElementById('app');
  try {
    if (typeof hideSplash === 'function') hideSplash();
    else {
      const splash = document.getElementById('splashScreen');
      if (splash) splash.style.display = 'none';
    }
    a11yDetachFocusTrap(pinEl);
    if (appEl) {
      appEl.inert = false;
      appEl.removeAttribute('inert');
      appEl.style.display = '';
      appEl.style.visibility = 'visible';
      appEl.classList.add('hc-app-booting');
    }
    if (pinEl) pinEl.style.display = 'none';
    if (getAuthRememberMinutes() > 0) localStorage.setItem(AUTH_TS_KEY, String(Date.now()));
    else localStorage.removeItem(AUTH_TS_KEY);
    appBootstrapped = true;
    const runInit = function () {
      try {
        var intentosInit = 0;
        var runInit = function () {
          if (typeof initApp !== 'function') {
            intentosInit++;
            if (intentosInit > 120) {
              throw new Error('initApp no cargó — Ctrl+Shift+R o borra caché del sitio.');
            }
            setTimeout(runInit, 50);
            return;
          }
          initApp();
        };
        runInit();
      } catch (eInit) {
        try {
          console.error('initApp tras PIN', eInit);
        } catch (_) {}
        /* Mantener la app visible: un fallo parcial no debe devolver al teclado PIN. */
        try {
          if (typeof goTab === 'function') goTab('inicio');
        } catch (_) {}
        try {
          if (typeof showToast === 'function') {
            var det =
              eInit && (eInit.message || String(eInit))
                ? String(eInit.message).replace(/\s+/g, ' ').trim().slice(0, 120)
                : '';
            showToast(
              det
                ? 'Arranque incompleto: ' + det + ' · Recarga (Ctrl+F5).'
                : 'Arranque incompleto. Recarga la página (Ctrl+F5).',
              true,
              { durationMs: 7000 }
            );
          }
        } catch (_) {}
        if (appEl) {
          appEl.classList.remove('hc-app-booting');
          appEl.inert = false;
        }
        return;
      } finally {
        appUnlockInProgress = false;
      }
    };
    setTimeout(runInit, 0);
  } catch (e) {
    console.error('Error inicializando app tras PIN:', e);
    appUnlockInProgress = false;
    appBootstrapped = false;
    if (appEl) appEl.inert = true;
    if (pinEl) {
      pinEl.style.display = '';
      a11yAttachFocusTrap(pinEl);
    }
    const pinErr = document.getElementById('pinErr');
    let det = '';
    try {
      const msg = e && (e.message || String(e));
      if (msg) det = String(msg).replace(/\s+/g, ' ').trim().slice(0, 140);
    } catch (_) {}
    if (pinErr) {
      pinErr.textContent = det
        ? 'Error al abrir: ' + det + ' · Reintenta o recarga (Ctrl+F5).'
        : 'No se pudo abrir la app. Reintenta o recarga forzada.';
    }
    showToast('Error al iniciar. Si persiste, borra datos del sitio o reinstala la app.', true);
  }
}

function lockAppWithPin() {
  if (appBootstrapped || appUnlockInProgress) return;
  const appEl = document.getElementById('app');
  const pinEl = document.getElementById('pinScreen');
  const statusEl = document.getElementById('pinAuthStatus');
  if (appEl) appEl.inert = true;
  if (statusEl) statusEl.textContent = '';
  if (pinEl) {
    pinEl.style.display = '';
    a11yAttachFocusTrap(pinEl);
    requestAnimationFrame(() => {
      try { pinEl.focus(); } catch (_) {}
    });
  }
}

async function tryBiometricUnlock() {
  try {
    const cap = window.Capacitor;
    const statusEl = document.getElementById('pinAuthStatus');
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return false;
    const biom = cap.Plugins && cap.Plugins.NativeBiometric;
    if (!biom) return false;

    const availability = await biom.isAvailable();
    if (!availability || !availability.isAvailable) return false;
    if (statusEl) statusEl.textContent = 'Intentando desbloqueo biométrico…';

    await biom.verifyIdentity({
      reason: 'Desbloquear HidroGrow',
      title: 'Identificación biométrica',
      subtitle: 'Usa la biometría de tu dispositivo',
      description: 'Si cancelas, podrás entrar con PIN',
    });
    return true;
  } catch (_) {
    return false;
  }
}

function pinPress(d) {
  if (pinEntry.length >= 4) return;
  pinEntry += d;
  updatePinDots();
  if (pinEntry.length === 4) setTimeout(checkPin, 180);
}

function pinDel() {
  pinEntry = pinEntry.slice(0, -1);
  updatePinDots();
  const err = document.getElementById('pinErr');
  if (err) err.textContent = '';
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('d' + i);
    if (d) d.className = 'pin-dot' + (i < pinEntry.length ? ' on' : '');
  }
}

function checkPin() {
  if (pinEntry === PIN) {
    pinEntry = '';
    updatePinDots();
    unlockAndInitApp();
  } else {
    for (let i = 0; i < 4; i++) {
      const di = document.getElementById('d' + i);
      if (di) di.className = 'pin-dot err';
    }
    const err = document.getElementById('pinErr');
    if (err) err.textContent = 'PIN incorrecto';
    setTimeout(() => {
      pinEntry = '';
      updatePinDots();
      const e2 = document.getElementById('pinErr');
      if (e2) e2.textContent = '';
    }, 1000);
  }
}

