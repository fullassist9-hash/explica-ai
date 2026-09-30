/* EXPLICA AI — service worker: abre offline depois da primeira visita. */
const V = 'explica-v13';
const CORE = ['./', 'index.html', 'tokens.css?v=11', 'styles.css?v=11', 'platform.css?v=11', 'geo.js?v=11', 'core.js?v=11', 'icons.js?v=11', 'globe.js?v=11', 'tutor.js?v=12', 'profiles.seed.js?v=11', 'pack-geo-missao-brasil.js?v=11', 'app.js?v=12', 'img/favicon.svg', 'img/icon-192.png', 'img/symbol-positive.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const cp = res.clone(); if (res.ok) caches.open(V).then(c => c.put('index.html', cp)); return res; }).catch(() => caches.match('index.html'))); return; }
  const same = u.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return;
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});
