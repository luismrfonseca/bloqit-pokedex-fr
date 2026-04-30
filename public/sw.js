// Cache names — bump the version string to force cache refresh on deploy
const STATIC_CACHE = 'pokedex-static-v5';
const DYNAMIC_CACHE = 'pokedex-dynamic-v4';
const IMAGE_CACHE = 'pokedex-images-v4';

const ALL_CACHES = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

const POKEMON_COUNT = 1350;
const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Shown for any image that isn't in the cache yet (e.g. before pre-caching
// finishes, or if the user goes offline before a particular image was ever fetched).
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#f3f4f6" rx="12"/>
  <circle cx="60" cy="60" r="36" fill="none" stroke="#d1d5db" stroke-width="3"/>
  <path d="M24 60 Q24 24 60 24 Q96 24 96 60" fill="#fca5a5" stroke="#d1d5db" stroke-width="3"/>
  <path d="M24 60 Q24 96 60 96 Q96 96 96 60" fill="#f9fafb" stroke="#d1d5db" stroke-width="3"/>
  <line x1="24" y1="60" x2="96" y2="60" stroke="#d1d5db" stroke-width="3"/>
  <circle cx="60" cy="60" r="9" fill="#f9fafb" stroke="#d1d5db" stroke-width="3"/>
  <circle cx="60" cy="60" r="4" fill="#e5e7eb"/>
</svg>`;

const ESSENTIAL_URLS = [
  '/',
  '/pokedex'
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('[SW] Instalando e cacheando recursos essenciais...');
      const promises = ESSENTIAL_URLS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Status ${response.status}`);
          // Guardamos a URL absoluta para evitar problemas de match
          const fullUrl = new URL(url, self.location.origin).href;
          return await cache.put(fullUrl, response);
        } catch (error) {
          console.warn(`[SW] Falha ao cachear ${url}:`, error);
        }
      });
      await Promise.all(promises);
      return self.skipWaiting();
    })
  );
});
// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
      .then(() => precacheArtwork())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Ignore Next.js HMR and Server Prefetch to avoid Hydration Mismatch
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.search.includes('_rsc') || 
    (url.pathname.startsWith('/api/') && url.origin === self.location.origin)
  ) return;

  // CacheFirst
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(cacheFirstWithPlaceholder(request));
    return;
  }

  // Static assets -> CacheFirst
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Pages and Data -> NetworkFirst
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});


// ─── Strategies ───────────────────────────────────────────────────────────────
async function cacheFirstWithPlaceholder(request) {
  const cache = await caches.open(IMAGE_CACHE);
  // Match ignoring query strings and headers Vary
  const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(PLACEHOLDER_SVG, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Only save to cache if it's navigation or API data
      if (request.mode === 'navigate' || request.url.includes('pokeapi.co')) {
        cache.put(request, response.clone());
      }
      return response;
    }
    throw new Error('Network response was not ok');
  } catch {
    // 1. Try exact match in all caches (necessary for APIs with query params)
    let cached = await caches.match(request);
    if (cached) return cached;

    // 2. If it's navigation, try ignoring search params
    if (request.mode === 'navigate') {
      cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;

      // 3. Final fallback to home
      const home = await caches.match('/');
      if (home) return home;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Pre-caching images
async function precacheArtwork() {
  const cache = await caches.open(IMAGE_CACHE);
  const BATCH_SIZE = 15;

  for (let start = 1; start <= POKEMON_COUNT; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, POKEMON_COUNT);
    const batch = [];

    for (let id = start; id <= end; id++) {
      const url = `${ARTWORK_BASE}/${id}.png`;
      batch.push(
        cache.match(url).then(async (hit) => {
          if (hit) return; 
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) await cache.put(url, res);
          } catch { /* ignore */ }
        })
      );
    }

    await Promise.allSettled(batch);
    // Short pause to avoid blocking the main thread excessively
    await new Promise(r => setTimeout(r, 10));
  }
  console.log('[SW] Pre-cache of images completed.');
};
