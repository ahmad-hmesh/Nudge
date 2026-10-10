// Bump this number whenever you change index.html or other cached files
const CACHE_NAME = 'nudge-cache-v2';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Runs when a new version of the service worker is installed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Removes old caches and takes over open pages straight away
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET requests. Task data (/tasks) always goes to the network.
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/tasks')) return;

  // Pages: try the network first so updates arrive, fall back to the saved copy when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Icons, manifest and other files: saved copy first, then the network
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
