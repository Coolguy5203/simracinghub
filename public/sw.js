// SimRacer Hub service worker — network-first navigation with an offline fallback.
const CACHE = 'srh-v1'
const OFFLINE_URL = '/offline'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([OFFLINE_URL, '/icons/icon-192.png']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  // Page navigations: try the network, fall back to the offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(cached => cached ?? Response.error())
      )
    )
    return
  }
  // Static assets under /icons and Next's immutable chunks: cache-first.
  const url = new URL(request.url)
  if (url.origin === location.origin && (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/_next/static/'))) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached ??
        fetch(request).then(res => {
          const copy = res.clone()
          caches.open(CACHE).then(cache => cache.put(request, copy))
          return res
        })
      )
    )
  }
})
