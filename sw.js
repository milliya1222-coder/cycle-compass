// 讓「加到主畫面」之後，沒有網路也打得開。
// 改版時把 版本 的數字 +1，使用者下次開就會拿到新的。
const 版本 = 'cycle-compass-v8';
const 要存的 = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './wm-logo.png', './milliya-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(版本).then(c => c.addAll(要存的)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== 版本).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 先拿網路上的新版；沒網路才退回存起來的那份
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const 副本 = res.clone();
        caches.open(版本).then(c => c.put(e.request, 副本)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
