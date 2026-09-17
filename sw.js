const CACHE_NAME = "smart-herb-v1";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./180.png",
  "./192.png",
  "./512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Krub:wght@400;600;700&family=Mitr:wght@300;400;600&display=swap"
];

// ติดตั้งและบังคับใช้ทันที
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

// ลบ Cache เวอร์ชันเก่าออกทั้งหมด
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ดึงข้อมูลจาก Network ก่อน ถ้าไม่มีอินเทอร์เน็ตค่อยดึงจาก Cache (Network-First)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
