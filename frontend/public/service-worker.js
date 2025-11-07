/* eslint-disable no-restricted-globals */

// Service Worker para Arroyo Seco PWA
// Versión del cache - incrementar para forzar actualización
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `arroyo-seco-${CACHE_VERSION}`;

// URLs que se cachearán inmediatamente al instalar
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/offline.html'
];

// URLs de API que se cachearán dinámicamente
const API_CACHE_NAME = `arroyo-seco-api-${CACHE_VERSION}`;
const API_URLS = [
  '/api/properties',
  '/api/accommodation-types',
  '/api/services'
];

// Tiempo de vida del cache de API (en milisegundos)
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// ===========================================
// INSTALACIÓN DEL SERVICE WORKER
// ===========================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-cacheando archivos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        // Activar el nuevo service worker inmediatamente
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error en instalación:', error);
      })
  );
});

// ===========================================
// ACTIVACIÓN DEL SERVICE WORKER
// ===========================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Eliminar caches antiguos
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('arroyo-seco-') &&
                     cacheName !== CACHE_NAME &&
                     cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activación completada');
        // Tomar control de todas las páginas inmediatamente
        return self.clients.claim();
      })
  );
});

// ===========================================
// INTERCEPTAR PETICIONES (FETCH)
// ===========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar chrome-extension y otras URLs especiales
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // ESTRATEGIA 1: API Requests - Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // ESTRATEGIA 2: Assets estáticos - Cache First, fallback to network
  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // ESTRATEGIA 3: Páginas HTML - Network First con fallback offline
  event.respondWith(networkFirstWithOfflineFallback(request));
});

// ===========================================
// ESTRATEGIA: NETWORK FIRST
// ===========================================
async function networkFirstStrategy(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(request);

    // Si la respuesta es exitosa, cachearla
    if (networkResponse && networkResponse.status === 200) {
      // Clonar la respuesta antes de cachearla
      const responseToCache = networkResponse.clone();

      // Cachear con timestamp para TTL
      cache.put(request, responseToCache).then(() => {
        // Guardar timestamp
        const timestampKey = `${request.url}-timestamp`;
        cache.put(
          new Request(timestampKey),
          new Response(Date.now().toString())
        );
      });
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, buscando en cache:', request.url);

    // Si falla la red, intentar obtener del cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Verificar si el cache es muy antiguo
      const timestampKey = `${request.url}-timestamp`;
      const timestampResponse = await cache.match(new Request(timestampKey));

      if (timestampResponse) {
        const timestamp = parseInt(await timestampResponse.text());
        const age = Date.now() - timestamp;

        if (age < API_CACHE_TTL) {
          console.log('[Service Worker] Retornando desde cache (fresco):', request.url);
          return cachedResponse;
        } else {
          console.log('[Service Worker] Cache expirado, pero retornando de todos modos:', request.url);
        }
      }

      return cachedResponse;
    }

    // Si no hay cache, retornar respuesta offline
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        offline: true,
        message: 'No hay conexión a internet y no hay datos en caché'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    );
  }
}

// ===========================================
// ESTRATEGIA: CACHE FIRST
// ===========================================
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Retornando desde cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Error fetching:', request.url, error);

    // Retornar placeholder para imágenes
    if (request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e5e7eb" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">Sin imagen</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }

    throw error;
  }
}

// ===========================================
// ESTRATEGIA: NETWORK FIRST CON OFFLINE FALLBACK
// ===========================================
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    // Cachear la respuesta si es exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, buscando en cache');

    // Intentar obtener del cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hay cache, mostrar página offline
    const offlinePage = await cache.match('/offline.html');

    if (offlinePage) {
      return offlinePage;
    }

    // Fallback HTML mínimo
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin Conexión - Arroyo Seco</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f3f4f6;
            color: #1f2937;
          }
          .container {
            text-align: center;
            padding: 2rem;
            max-width: 400px;
          }
          h1 { color: #ef4444; margin-bottom: 1rem; }
          p { margin-bottom: 1.5rem; color: #6b7280; }
          button {
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover { background: #0284c7; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📡 Sin Conexión</h1>
          <p>No tienes conexión a internet. Por favor verifica tu conexión e intenta de nuevo.</p>
          <button onclick="window.location.reload()">Reintentar</button>
        </div>
      </body>
      </html>
      `,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html'
        })
      }
    );
  }
}

// ===========================================
// MENSAJES DEL CLIENTE
// ===========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

console.log('[Service Worker] Cargado correctamente');
