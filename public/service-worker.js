const CACHE_NAME = 'app-cache-v2'; // ⚡ Cambia el número cuando publiques algo nuevo
const urlsToCache = [
  '/',
  '/index.html',
  '/main.css',
  '/main.js',
  '/login',
  '/chat',
  '/calendario',
  '/paciente',
  '/perfil',
  '/registro',
  '/bienvenidos',
  '/not-found',
];

// Instalar y cachear archivos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando nueva versión...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // ⚡ Activa inmediatamente
});

// Activar y limpiar cachés viejos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activado, limpiando cachés viejos...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // ⚡ Controla las páginas abiertas
});

// Estrategia Network First para siempre obtener lo último
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guarda copia en caché
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Si falla la red, usa caché
        return caches.match(event.request);
      })
  );
});
