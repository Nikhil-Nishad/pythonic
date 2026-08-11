const CACHE_NAME = 'snake-game-v4.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './instructions.html',
    './blog.html',
    './styles.css',
    './game.js',
    './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // HTML Navigation requests: Network First, Fallback to Cache
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((cached) => {
                        if (cached) return cached;
                        if (url.pathname.includes('instructions')) return caches.match('./instructions.html');
                        if (url.pathname.includes('blog')) return caches.match('./blog.html');
                        return caches.match('./index.html');
                    });
                })
        );
        return;
    }

    // Static assets: Cache First, Fallback to Network
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});
