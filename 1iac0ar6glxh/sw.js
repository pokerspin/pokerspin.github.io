/* Poker Spin Trainer, version web : l'appli marche sans internet une fois ouverte.
   La page est servie depuis le cache tout de suite, et mise à jour en arrière-plan
   quand il y a internet (la nouvelle version s'affiche à l'ouverture suivante). */
const CACHE = 'pst-web-v5.2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // listes de clés : toujours en ligne, jamais en cache
  if (url.hostname === 'raw.githubusercontent.com') return;
  const isPage = req.mode === 'navigate';
  const key = isPage ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key);
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) c.put(key, r.clone());
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
