const CACHE_VERSION = 'v1.0.1'
const CACHE_NAME = `barberbro-cache-${CACHE_VERSION}`
const OFFLINE_URL = '/offline'

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/favicon.ico',
]

const CACHE_STRATEGIES = {
  networkFirst: [
    '/api/',
    '/',
    '/dashboard',
    '/pos',
    '/salaries',
    '/attendance',
    '/inventory',
    '/cashflow',
    '/barbers',
    '/settings',
    '/transactions',
  ],
  cacheFirst: [
    '/_next/static/',
    '/fonts/',
    '/images/',
  ],
  staleWhileRevalidate: [],
}

function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

function isApiRequest(url) {
  return CACHE_STRATEGIES.networkFirst.some(pattern => url.pathname.startsWith(pattern))
}

function isStaticAsset(url) {
  return CACHE_STRATEGIES.cacheFirst.some(pattern => url.pathname.includes(pattern))
}

function isStaleWhileRevalidate(url) {
  return CACHE_STRATEGIES.staleWhileRevalidate.some(pattern => url.pathname === pattern || url.pathname.startsWith(pattern + '/'))
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return new Response('Network error', { status: 408 })
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response(JSON.stringify({ error: 'Offline', message: 'Tidak ada koneksi internet' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('barberbro-cache-') && cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== location.origin) {
    return
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then(c => c.put(request, response.clone()))
          }
          return response
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          return caches.match(OFFLINE_URL)
        })
    )
    return
  }

  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  if (isStaleWhileRevalidate(url)) {
    event.respondWith(staleWhileRevalidateStrategy(request))
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && request.method === 'GET') {
          const cache = caches.open(CACHE_NAME)
          cache.then(c => c.put(request, response.clone()))
        }
        return response
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request)
        return cachedResponse || new Response('Offline', { status: 503 })
      })
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
