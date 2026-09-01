/* Mundo Digital STP PWA
   Estratégia segura: navegação network-first; cache só da interface local.
   Firebase/Firestore e operações financeiras NÃO são interceptadas nem simuladas offline. */
const CACHE_NAME = 'mdstp-shell-2026-09-01-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nunca controlar tráfego Firebase/Google externo.
  if(url.origin !== self.location.origin) return;

  // HTML/navegação: sempre procurar a versão publicada primeiro.
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

  // Arquivos locais PWA: cache-first com atualização normal pelo ciclo do SW.
  if(url.pathname.endsWith('/manifest.json') || url.pathname.includes('/icons/')) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});
