const CACHE_NAME = 'snake-game-v5.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './instructions.html',
    './blog.html',
    './styles.css',
    './game.js',
    './manifest.webmanifest',
    './blog/best-snake-games-compared.html',
    './blog/modern-snake-vs-nokia-snake-2.html',
    './blog/cognitive-benefits-of-playing-snake.html',
    './blog/beginners-guide-to-snake-game.html',
    './blog/no-ad-pwa-web-games.html',
    './blog/evolution-of-snake.html',
    './blog/high-score-tactics.html',
    './blog/building-60fps-canvas-games.html',
    './blog/gameplay-mechanics-and-combos.html',
    './blog/procedural-audio-synthesis.html',
    './blog/mobile-touch-controls-haptics.html',
    './blog/web-game-seo-guide.html',
    './blog/astar-pathfinding-ai-rivals.html'
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

    // Skip non-origin requests
    if (url.origin !== self.origin) return;

    // For HTML navigation requests, try network first, fallback to cached HTML
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Handle 304 Not Modified: return cached version instead
                    if (networkResponse && networkResponse.status === 304) {
                        return caches.match(event.request).then((cached) => {
                            return cached || networkResponse;
                        });
                    }
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                    return networkResponse;
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

    // For static assets (CSS, JS, manifest), try cache first, fallback to network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            });
        })
    );
});
