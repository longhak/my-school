// Service Worker សាមញ្ញ៖ ធ្វើឲ្យ App អាច Install បាន ហើយបើកបានលឿន
// ប្តូរលេខ version ខាងក្រោម ពេលចង់បង្ខំឲ្យ cache ថ្មី
const CACHE = 'sotip-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './sotip.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first៖ ព្យាយាមយកពី GitHub Pages មុន (បានកំណែថ្មីជានិច្ច) បើគ្មានអ៊ីនធឺណិតទើបប្រើ cache
// Firebase និង CDN (ដែនផ្សេង) មិនត្រូវបានប៉ះពាល់ទេ
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
