// Cache hors ligne : l'app reste utilisable en salle sans réseau.
// Stratégie "réseau d'abord" : si internet est disponible, on prend toujours la dernière version ;
// sinon on sert la copie en cache.
const CACHE = 'musculation-v2';
const FICHIERS = ['./', './index.html', './style.css', './app.js', './exercices.js', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((clés) =>
    Promise.all(clés.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copie = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copie));
      return r;
    }).catch(() => caches.match(e.request).then((rep) => rep || caches.match('./index.html')))
  );
});
