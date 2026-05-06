const CACHE_NAME = 'pwa-cache-v1';
const assets = [
  '/',
  '/index.html',
  // Add other static files here like your CSS, main JS, or images
];

// Install the service worker and cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(assets);
    })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercept network requests
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Strategy 1: Features that need the backend (Network-First)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .catch(() => {
          // Fallback if the user is offline and trying to reach the backend
          return new Response(JSON.stringify({ error: 'You are offline, cannot reach the server.' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  } 
  // Strategy 2: Features that do not need the backend (Cache-First)
  else {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        // Return from cache, otherwise fetch from network
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request);
      })
    );
  }
});
