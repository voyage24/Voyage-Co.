// Minimal service worker: precache the offline fallback and serve a cached
// shell when the network is unavailable. Static assets are cached on the fly.
const CACHE = "vc-cache-v4";
const OFFLINE_URL = "/offline";
// Caches to preserve across version bumps (user-saved offline guides).
const KEEP = [CACHE, "vc-guides", "vc-wallet"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE_URL])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Web push: show the notification, set the app-icon badge count, and focus/open
// the app on click.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  const title = data.title || "Voyages & Co.";
  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/logo-navy.png",
      badge: "/logo-navy.png",
      data: { url: data.url || "/" },
    });
    // Unread count for the app-icon badge (Badging API).
    if (typeof data.count === "number" && self.navigator && self.navigator.setAppBadge) {
      try { await self.navigator.setAppBadge(data.count); } catch (e) { /* unsupported */ }
    }
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const c of list) { if ("focus" in c) { c.navigate(url); return c.focus(); } }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Navigations: network-first, fall back to the cached page then offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Static assets: cache-first.
  if (/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?)$/.test(new URL(req.url).pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
      }).catch(() => cached))
    );
  }
});
