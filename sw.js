// 부동산 각도기 — 오프라인 지원. 화면(index.html)은 늘 새로 받아 보고, 안 되면 마지막에 받은 것을 보여 준다.
const CACHE = 'gakdogi-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png?v=2', 'icon-512.png?v=2', 'apple-touch-icon.png?v=2', 'favicon.png?v=2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.url.endsWith('/') || req.url.endsWith('index.html');
  if (isPage) {
    // 화면은 새것 먼저 (매일 갱신되므로)
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put('index.html', copy));
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
