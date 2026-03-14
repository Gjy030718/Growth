// 定义缓存名称和需要缓存的文件列表
const CACHE_NAME = 'growth-trainer-v1';
const urlsToCache = [
  '/Growth-Trainer/',
  '/Growth-Trainer/index.html',
  '/Growth-Trainer/styles.css',
  '/Growth-Trainer/script.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// 安装Service Worker，并缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存核心文件');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活时，清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清理旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求，优先返回缓存内容
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回缓存
        if (response) {
          return response;
        }
        // 否则去网络请求
        return fetch(event.request)
          .then(response => {
            // 只缓存成功的GET请求
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
              return response;
            }
            // 克隆响应以进行缓存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      }).catch(() => {
        // 如果网络失败且缓存中没有，可以返回一个离线回退页面
        return caches.match('/Growth-Trainer/index.html');
      })
  );
});

