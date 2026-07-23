// Ficheiro para permitir que o navegador reconheça o site como uma App instalável
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Mantém a ligação em tempo real com o Firebase
  e.respondWith(fetch(e.request));
});
