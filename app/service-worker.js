// ============================================================
// Service Worker – macht die App offline-fähig und installierbar.
// Einfache "Cache-first"-Strategie.
//
// WICHTIG: Wenn du Dateien änderst und die Änderung nicht siehst,
// erhöhe die CACHE_VERSION (v1 -> v2). Dann wird neu gecacht.
// ============================================================

const CACHE_VERSION = "woerdle-v6";
const DATEIEN = [
  "index.html",
  "style.css",
  "app.js",
  "woerter.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(DATEIEN))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((schluessel) =>
      Promise.all(
        schluessel.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((treffer) => treffer || fetch(event.request))
  );
});