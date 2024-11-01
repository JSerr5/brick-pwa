const CACHE_NAME = "brick-cache-v2"; // Cambia el nombre para forzar actualizaciones
const urlsToCache = [
  "/",
  "/index.html",
  "/logo192.png",
  "/logo512.png",
  "/static/js/main.js", // Incluye archivos JS/CSS principales
  "/static/css/main.css",
];

// Instalar el Service Worker y almacenar los recursos estáticos en la caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Archivos en caché durante la instalación");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => console.error("Fallo en la instalación del SW:", error))
  );
});

// Activar el Service Worker y limpiar versiones antiguas de caché
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log("Eliminando caché antigua:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch((error) => console.error("Fallo en la activación del SW:", error))
  );
  // Forzar al nuevo SW a tomar control inmediato
  return self.clients.claim();
});

// Interceptar solicitudes y aplicar estrategias de caché
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo maneja solicitudes GET (para evitar manipular POST, PUT, DELETE, etc.)
  if (request.method !== "GET") return;

  // Filtrar solicitudes que no sean HTTP o HTTPS
  if (!request.url.startsWith("http")) {
    // Ignorar y no procesar solicitudes que no sean HTTP/HTTPS
    return;
  }

  // Aplicar una estrategia de "Network First" para archivos dinámicos
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Aplicar una estrategia de "Cache First" para archivos estáticos
    event.respondWith(
      caches.match(request).then((cacheResponse) => {
        return (
          cacheResponse ||
          fetch(request)
            .then((networkResponse) => {
              // Almacenar en caché los recursos dinámicos solo si son del sitio
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              });
            })
            .catch(() => caches.match("/offline.html")) // Archivo de fallback para offline
        );
      })
    );
  }
});

// Manejo de errores y recursos faltantes con archivo de fallback
self.addEventListener("error", (event) => {
  console.error("Error en el SW:", event.message);
});

// Notificación de actualización de SW al usuario
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
