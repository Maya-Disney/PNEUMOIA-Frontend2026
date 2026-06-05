// public/sw.js
const CACHE_NAME = 'pneumoia-v1';
const ONNX_CACHE = 'pneumoia-models-v1';

const STATIC_ASSETS = ['/', '/index.html', '/models/metadata.json'];
const MODEL_ASSETS  = ['/models/model_base.onnx', '/models/model_equipe.onnx'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)),
      caches.open(ONNX_CACHE).then(c => c.addAll(MODEL_ASSETS)),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== ONNX_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne pas intercepter les fichiers source Vite (dev) ni les imports dynamiques
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/@')) {
    return;
  }

  // Modèles ONNX → cache d'abord
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(ONNX_CACHE).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // ── IMPORTANT : appels API → NE PAS intercepter ──────────────
  // On laisse le fetch échouer naturellement (TypeError/Failed to fetch)
  // Le composant React gère lui-même la bascule offline
  if (url.pathname.startsWith('/api/')) {
    return; // ← pas de event.respondWith → fetch normal
  }

  // Assets statiques → cache puis réseau
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});