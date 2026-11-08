// Cache hors ligne : l'app reste utilisable en salle sans réseau.
// Stratégie "réseau d'abord" : si internet est disponible, on prend toujours la dernière version ;
// sinon on sert la copie en cache. GitHub Pages autorise 10 minutes de cache navigateur :
// on demande donc toujours au serveur de confirmer la version (cache 'no-cache' / 'reload').
const CACHE = 'musculation-v32';
const FICHIERS = [
  './', './index.html', './style.css', './app.js', './exercices.js', './cuisine.js', './batch.js', './monde.js', './anatomie.js',
  './manifest.json', './icon-cadence-v4.svg', './apple-touch-icon.png', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', (e) => {
  // Fichier par fichier : un fichier manquant ne bloque pas toute l'installation
  e.waitUntil(caches.open(CACHE).then((c) =>
    Promise.allSettled(FICHIERS.map((f) => c.add(new Request(f, { cache: 'reload' }))))));
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
    // Même site : on revalide auprès du serveur au lieu de prendre la copie du navigateur
    (new URL(e.request.url).origin === self.location.origin
      ? fetch(new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }))
      : fetch(e.request)
    ).then((r) => {
      if (r.ok) {
        const copie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
      }
      return r;
    }).catch(() => caches.match(e.request).then((rep) => rep || caches.match('./index.html')))
  );
});
