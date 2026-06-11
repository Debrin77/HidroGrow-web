/**
 * Service Worker / PWA, arranque PIN/biometría, IndexedDB fotos.
 * Tras app-hc-torres-badges-notifs.js.
 */
// --------------------------------------------------
// SERVICE WORKER + ARRANQUE
// --------------------------------------------------

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  var hcRegisterSw = function () {
    navigator.serviceWorker
      .register('service-worker.js?v=2026-06-01-perf76')
      .then(function (reg) {
        try {
          console.log('[HidroGrow] SW registrado:', reg.scope);
        } catch (_) {}
      })
      .catch(function (err) {
        try {
          console.warn('[HidroGrow] SW error:', err);
        } catch (_) {}
      });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hcRegisterSw);
  } else {
    setTimeout(hcRegisterSw, 0);
  }
}

/** Safari iOS / iPadOS no dispara beforeinstallprompt: la instalación es manual. */
function esPlataformaIOSWeb() {
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return iOS;
}

// Instalar PWA manualmente (Chrome/Edge/Android) o indicar pasos en iOS
function instalarPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') {
        showToast('✅ Instalando HidroGrow…');
      }
      deferredPrompt = null;
    });
    return;
  }
  if (esPlataformaIOSWeb()) {
    showToast(
      'En iPhone/iPad: Safari → icono compartir → «Añadir a la pantalla de inicio». Así tendrás icono propio como una app.',
      false
    );
    return;
  }
  showToast(
    'Si no aparece el instalador, usa el menú del navegador («Instalar app» o «Crear acceso directo»). En escritorio suele salir tras usar la página un rato.',
    false
  );
}

// Detectar instalación PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  // Mostrar botón de instalación si está disponible
  const installBtn = document.getElementById('installPWABtn');
  if (installBtn) installBtn.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const installBtn = document.getElementById('installPWABtn');
  if (installBtn) installBtn.style.display = 'none';
  showToast('✅ HidroGrow instalada correctamente');
});

function hcSplashMinVisibleMs() {
  return 0;
}
const splashShownAtMs = Date.now();

function hideSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) splash.style.display = 'none';
}
window.hideSplash = hideSplash;

async function waitSplashMinimumVisible() {
  const minMs = hcSplashMinVisibleMs();
  const elapsed = Date.now() - splashShownAtMs;
  if (elapsed >= minMs) return;
  await new Promise(function (resolve) {
    setTimeout(resolve, minMs - elapsed);
  });
}

// Failsafe para WebView: evita splash infinito si window.onload no llega.
setTimeout(hideSplash, 1200);

function hcBindPinScreenListeners() {
  document.querySelectorAll('.pin-key[data-digit]').forEach(function (key) {
    if (key.dataset.hcPinBound === '1') return;
    key.dataset.hcPinBound = '1';
    key.addEventListener('click', function () {
      pinPress(key.dataset.digit);
    });
  });
  var delBtn = document.getElementById('pinDelBtn');
  if (delBtn && delBtn.dataset.hcPinBound !== '1') {
    delBtn.dataset.hcPinBound = '1';
    delBtn.addEventListener('click', pinDel);
  }
  if (!window._hcPinKeydownBound) {
    window._hcPinKeydownBound = true;
    document.addEventListener('keydown', function (e) {
      var pinScr = document.getElementById('pinScreen');
      if (!pinScr || pinScr.style.display === 'none') return;
      if (e.key >= '0' && e.key <= '9') pinPress(e.key);
      if (e.key === 'Backspace') pinDel();
    });
  }
}

function hcRunAppBootSequence() {
  if (window._hcAppBootSequenceStarted) return;
  window._hcAppBootSequenceStarted = true;
  if (typeof pinPress !== 'function' || typeof unlockAndInitApp !== 'function') {
    try {
      hideSplash();
    } catch (_) {}
    return;
  }
  hcBindPinScreenListeners();

  (async function () {
    hideSplash();
    if (typeof hcBootUpdatePinProgress === 'function') {
      try {
        hcBootUpdatePinProgress();
      } catch (_) {}
    }

    if (appBootstrapped || (typeof appUnlockInProgress !== 'undefined' && appUnlockInProgress)) return;

    if (hasValidAuthSession()) {
      if (typeof hcWhenAppScriptsReady === 'function') {
        hcWhenAppScriptsReady(unlockAndInitApp, { timeoutMs: 90000 });
      } else {
        unlockAndInitApp();
      }
      return;
    }
    lockAppWithPin();
    setTimeout(async function () {
      if (appBootstrapped || (typeof appUnlockInProgress !== 'undefined' && appUnlockInProgress)) {
        return;
      }
      var statusEl = document.getElementById('pinAuthStatus');
      var ok = await tryBiometricUnlock();
      if (appBootstrapped) return;
      if (ok) {
        if (typeof hcWhenAppScriptsReady === 'function') {
          hcWhenAppScriptsReady(unlockAndInitApp, { timeoutMs: 90000 });
        } else {
          unlockAndInitApp();
        }
      } else {
        var pinErr = document.getElementById('pinErr');
        if (pinErr) pinErr.textContent = '';
        if (statusEl) {
          statusEl.textContent = 'Biometría no disponible. Introduce tu PIN.';
        }
      }
    }, 150);
  })();
}

function hcScheduleVersionCheckOnIdle() {
  var run = function () {
    try {
      if (typeof gestionarCambioVersionEnArranque === 'function') {
        gestionarCambioVersionEnArranque();
      }
    } catch (_) {}
  };
  setTimeout(run, 0);
}

function hcShowPinAsap() {
  if (window._hcPinEarlyShown) return;
  window._hcPinEarlyShown = true;
  try {
    hcBindPinScreenListeners();
  } catch (_) {}
  try {
    hideSplash();
  } catch (_) {}
  if (typeof appBootstrapped !== 'undefined' && appBootstrapped) return;
  if (typeof appUnlockInProgress !== 'undefined' && appUnlockInProgress) return;
  try {
    if (typeof hasValidAuthSession === 'function' && hasValidAuthSession()) return;
  } catch (_) {}
  try {
    if (typeof lockAppWithPin === 'function') lockAppWithPin();
  } catch (_) {}
  try {
    if (typeof hcBootUpdatePinProgress === 'function') hcBootUpdatePinProgress();
  } catch (_) {}
}

if (document.body) {
  requestAnimationFrame(hcShowPinAsap);
} else {
  document.addEventListener('DOMContentLoaded', hcShowPinAsap);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    hcScheduleVersionCheckOnIdle();
    hcRunAppBootSequence();
  });
} else {
  hcScheduleVersionCheckOnIdle();
  hcRunAppBootSequence();
}

window.addEventListener('load', function () {
  if (!window._hcAppBootSequenceStarted) hcRunAppBootSequence();
});

function scheduleHcPreinitWhilePin() {}

// --------------------------------------------------
// FOTODB — IndexedDB para fotos (sin límite de tamaño)
// --------------------------------------------------
// FOTO_DB_NAME — hc-bootstrap-config.js
const FOTO_DB_VERSION = 1;
const FOTO_STORE      = 'fotos';
let fotoDB = null;

async function vaciarFotoDBEnArranque() {
  fotoDB = null;
  try {
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(FOTO_DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  } catch (_) {}
}

function abrirFotoDB() {
  return new Promise((resolve, reject) => {
    if (fotoDB) { resolve(fotoDB); return; }
    const req = indexedDB.open(FOTO_DB_NAME, FOTO_DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(FOTO_STORE)) {
        db.createObjectStore(FOTO_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess  = e => { fotoDB = e.target.result; resolve(fotoDB); };
    req.onerror    = e => reject(e.target.error);
  });
}

async function guardarFotoIDB(key, fotoObj) {
  const db = await abrirFotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FOTO_STORE, 'readwrite');
    tx.objectStore(FOTO_STORE).put({ key, ...fotoObj });
    tx.oncomplete = () => resolve(key);
    tx.onerror    = e => reject(e.target.error);
  });
}

async function leerFotoIDB(key) {
  const db = await abrirFotoDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(FOTO_STORE, 'readonly');
    const req = tx.objectStore(FOTO_STORE).get(key);
    req.onsuccess = e => resolve(e.target.result || null);
    req.onerror   = e => reject(e.target.error);
  });
}

async function leerFotosPorPrefijo(prefix) {
  const db = await abrirFotoDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(FOTO_STORE, 'readonly');
    const store = tx.objectStore(FOTO_STORE);
    const rango = IDBKeyRange.bound(prefix, prefix + '\uFFFF');
    const req   = store.getAll(rango);
    req.onsuccess = e => resolve(e.target.result || []);
    req.onerror   = e => reject(e.target.error);
  });
}

async function borrarFotoIDB(key) {
  const db = await abrirFotoDB();
  return new Promise((resolve) => {
    const tx = db.transaction(FOTO_STORE, 'readwrite');
    tx.objectStore(FOTO_STORE).delete(key);
    tx.oncomplete = resolve;
  });
}

// Migrar fotos antiguas que estaban en state.torre a IndexedDB
async function migrarFotosAIDB() {
  let migradas = 0;
  for (let n = 0; n < (state.torre || []).length; n++) {
    for (let c = 0; c < (state.torre[n] || []).length; c++) {
      const cesta = state.torre[n][c];
      if (!cesta || !cesta.fotos || cesta.fotos.length === 0) continue;
      for (let i = 0; i < cesta.fotos.length; i++) {
        const foto = cesta.fotos[i];
        if (!foto.data) continue; // ya migrada o sin data
        const key = 'foto_t0_n' + n + '_c' + c + '_' + (foto.isoDate || Date.now() + i).replace(/[:.]/g,'_');
        await guardarFotoIDB(key, foto);
        if (!cesta.fotoKeys) cesta.fotoKeys = [];
        cesta.fotoKeys.push(key);
        migradas++;
      }
      // Eliminar datos base64 del state (solo guardar keys)
      delete cesta.fotos;
    }
  }
  if (migradas > 0) {
    saveState();
    console.log('[HidroGrow] Migradas', migradas, 'fotos a IndexedDB');
  }
  return migradas;
}

