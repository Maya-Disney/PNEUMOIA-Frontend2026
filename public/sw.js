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

  // Ne pas intercepter les fichiers source Vite
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/@')) return;

  // Ne pas intercepter les appels API
  if (url.pathname.startsWith('/api/')) return;

  // Modèles ONNX → cache d'abord
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // ✅ Cloner AVANT toute opération sur la réponse
          const responseToCache = response.clone();
          caches.open(ONNX_CACHE).then(c => c.put(event.request, responseToCache));
          return response;
        });
      })
    );
    return;
  }

  // Assets statiques → cache puis réseau
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // ✅ Cloner AVANT de mettre en cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, responseToCache));
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});