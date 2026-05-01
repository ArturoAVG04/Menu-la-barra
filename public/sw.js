const CACHE_NAME = "la-barra-shell-v3";
const APP_SHELL = ["/", "/customer", "/login", "/manifest.json", "/icon.svg"];

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isCacheableAsset(requestUrl) {
  return (
    requestUrl.origin === self.location.origin &&
    (requestUrl.pathname.startsWith("/_next/static/") ||
      requestUrl.pathname.startsWith("/icons/") ||
      requestUrl.pathname === "/manifest.json" ||
      requestUrl.pathname === "/icon.svg")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  if (!isCacheableAsset(requestUrl)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});

self.addEventListener("push", (event) => {
  const fallback = {
    title: "Nuevo pedido",
    body: "Revisa el panel de pedidos",
    url: "/admin"
  };

  let data = fallback;

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.notification?.title || payload.title || fallback.title,
        body: payload.notification?.body || payload.body || fallback.body,
        url: payload.data?.url || payload.url || fallback.url
      };
    } catch (_error) {
      data = fallback;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: {
        url: data.url
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || "/admin";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url.includes(destination)) {
            return client.focus();
          }
        }
      }

      return clients.openWindow(destination);
    })
  );
});
