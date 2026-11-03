// Cache hors ligne : l'app reste utilisable en salle sans réseau.
// Stratégie "réseau d'abord" : si internet est disponible, on prend toujours la dernière version ;
// sinon on sert la copie en cache.
const CACHE = 'musculation-v6';
const FICHIERS = [
  './', './index.html', './style.css', './app.js', './exercices.js', './cuisine.js',
  './manifest.json', './icon-cadence-v4.svg', './apple-touch-icon.png', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', (e) => {
  // Fichier par fichier : un fichier manquant ne bloque pas toute l'installation
  e.waitUntil(caches.open(CACHE).then((c) =>
    Promise.allSettled(FICHIERS.map((f) => c.add(f)))));
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
      if (r.ok) {
        const copie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
      }
      return r;
    }).catch(() => caches.match(e.request).then((rep) => rep || caches.match('./index.html')))
  );
});
