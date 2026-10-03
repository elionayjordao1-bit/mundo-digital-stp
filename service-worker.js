/* Mundo Digital STP PWA — 6.24.7 / 2026.10.03-024
   Cache apenas da interface local.
   Firebase/Firestore e operações financeiras NÃO são simuladas offline. */

const CACHE_NAME = 'mdstp-shell-2026.10.03-024-v6247';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('mdstp-shell-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  if(req.mode === 'navigate') {
    event.respondWith(
      fetch(req, {cache:'no-store'})
        .then(resp => {
          if(resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  if(url.pathname.endsWith('/app-version.json') || url.pathname.endsWith('/service-worker.js')) {
    event.respondWith(fetch(req, {cache:'no-store'}));
    return;
  }

  if(url.pathname.endsWith('/manifest.json') || url.pathname.includes('/icons/')) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});
