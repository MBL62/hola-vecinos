const CACHE_NAME = 'hola-vecinos-v2'

// Solo cacheamos el shell básico (sin datos de vecinos)
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
]

// Instalar: precachear íconos y manifest
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

// Activar: limpiar versiones viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// NETWORK-FIRST: siempre intenta la red primero
// Los datos de vecinos (Supabase) siempre van directo a la red
self.addEventListener('fetch', (event) => {
  // Solo interceptar GET del mismo origen (la app)
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // APIs externas y Supabase: siempre red directa (nunca caché)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('stadiamaps.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    return // deja que el navegador lo maneje normalmente
  }

  // Para recursos propios: Network-first, caché solo como emergencia offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar en caché si es exitoso
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Sin red: intentar caché (solo para íconos y shell)
        return caches.match(event.request)
      })
  )
})

