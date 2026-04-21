const CACHE = 'salafull-v11';
const BASE = '/salafull';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Nu cachăm PUT/POST/DELETE - doar GET
  if(e.request.method !== 'GET') return;
  
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(BASE + '/index.html')));
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
      .then(r => {
        if (r) {
          const rc = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, rc));
          return r;
        }
        return caches.match(BASE + '/index.html');
      })
  );
});
