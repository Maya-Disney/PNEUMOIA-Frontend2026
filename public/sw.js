// public/sw.js — PneumoIA Service Worker v2
const CACHE_STATIC = 'pneumoia-static-v2';
const CACHE_PAGES  = 'pneumoia-pages-v2';
const CACHE_ONNX   = 'pneumoia-models-v1';

const STATIC_PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

const MODEL_ASSETS = [
  '/models/model_base.onnx',
  '/models/model_equipe.onnx',
];

// ── Install : précache assets statiques + modèles ─────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then(c => c.addAll(STATIC_PRECACHE)),
      caches.open(CACHE_ONNX).then(c =>
        Promise.allSettled(MODEL_ASSETS.map(url =>
          c.add(url).catch(() => {}) // modèles volumineux — échec non bloquant
        ))
      ),
    ]).then(() => self.skipWaiting())
  );
});

// ── Activate : purger les vieux caches ────────────────────────────
self.addEventListener('activate', (event) => {
  const KEEP = [CACHE_STATIC, CACHE_PAGES, CACHE_ONNX];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch : stratégies par type de ressource ─────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer : HMR Vite, websocket, extensions
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src/')) return;
  if (request.url.startsWith('chrome-extension://')) return;
  if (request.method !== 'GET') return;

  // API → network only, jamais de cache
  if (url.pathname.startsWith('/api/')) return;

  // Modèles ONNX → cache first
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(cacheFirst(request, CACHE_ONNX));
    return;
  }

  // Assets statiques (JS, CSS, images, fonts) → cache first
  if (
    url.pathname.match(/\.(js|css|png|svg|ico|woff2?|ttf|webp|jpg|jpeg)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Navigation HTML → network first, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Tout le reste → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_PAGES));
});

// ── Stratégies de cache ───────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_PAGES);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // SPA — renvoyer index.html depuis le cache (react-router gère la route)
    const index = await caches.match('/') || await caches.match('/index.html');
    if (index) return index;
    return caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise || caches.match('/offline.html');
}

// ── Background Sync : synchroniser les actions offline ────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'pneumoia-sync') {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (clients.length > 0) {
    // Demander à une page ouverte d'exécuter la synchronisation
    clients[0].postMessage({ type: 'BACKGROUND_SYNC' });
  }
  // Si aucun client ouvert, la sync se fera quand l'utilisateur rouvrira l'app
}

// ── Push Notifications ────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'PneumoIA', body: 'Nouvelle notification', icon: '/icon-192.png', tag: 'pneumoia' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch { /* payload non-JSON, on garde le défaut */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon || '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     data.tag  || 'pneumoia',
      data:    { url: data.url || '/' },
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(targetUrl); }
      else self.clients.openWindow(targetUrl);
    })
  );
});

// ── Messages depuis la page ────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
