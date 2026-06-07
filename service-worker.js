/**
 * HidroGrow — Service Worker ligero (PWA).
 * Precache: shell offline básico. APIs (Open-Meteo, etc.) siguen yendo a red.
 */
<<<<<<< HEAD
const CACHE_NAME = 'hidrogrow-shell-v38-sh-b5';
=======
const CACHE_NAME = 'hidrogrow-shell-v42-boot-ios';
>>>>>>> d4954b609af6dd6b222d50fc4328bab9f73ad996
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/hc-brand-canopy.css',
  './icons/splash-brand-gold.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './js/cultivos-db.js',
  './js/state-torre-logic.js',
  './js/ui-tabs.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[HidroGrow SW] precache omitido:', url, err);
              return null;
            })
          )
        )
      )
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[HidroGrow SW] install', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url || '';
  // Evita errores de FetchEvent con esquemas no gestionables (chrome-extension:, data:, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  // No interceptar llamadas a APIs externas (AEMET/Open-Meteo/met.no/etc.).
  // Así evitamos errores de respondWith y dejamos que el navegador gestione CORS/errores de red.
  const u = new URL(url);
  if (u.origin !== self.location.origin) return;

  // Documento: red primero; si falla (offline), sirve el shell cacheado
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // JS/CSS: siempre red (evita JS antiguo en caché tras actualizar)
  if (/\.(js|css)(\?|$)/i.test(u.pathname + (u.search || ''))) {
    event.respondWith(fetch(req, { cache: 'no-store' }));
    return;
  }

  // Resto: red; fallback caché solo offline
  event.respondWith(
    fetch(req, { cache: 'no-store' }).catch(() =>
      caches.match(req).then((r) => r || Response.error())
    )
  );
});
