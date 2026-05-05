const CACHE_NAME = 'hola-vecinos-v1'

// Archivos que se cachean al instalar la PWA
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Instalar: precachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Si falla algún asset, no bloqueamos la instalación
      })
    })
  )
  self.skipWaiting()
})

// Activar: limpiar cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: Network-first para API/Supabase, Cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Siempre ir a la red para Supabase, mapas y APIs externas
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('stadiamaps.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    event.request.method !== 'GET'
  ) {
    return // comportamiento normal del navegador
  }

  // Para el resto: Cache-first con fallback a red
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        // Solo cachear respuestas válidas de nuestro dominio
        if (
          response.status === 200 &&
          url.origin === self.location.origin
        ) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
    })
  )
})
