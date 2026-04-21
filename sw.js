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
  if(e.request.method !== 'GET') return;
  // Skip chrome-extension și alte scheme non-http
  if(!e.request.url.startsWith('http')) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(BASE + '/index.html')));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.status === 200) {
          const rc = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, rc)).catch(()=>{});
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match(BASE + '/index.html')))
  );
});
