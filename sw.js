const CACHE_NAME = 'snake-game-v3.2.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './instructions.html',
    './instructions',
    './blog.html',
    './blog',
    './styles.css',
    './game.js',
    './src/scoring.js',
    './src/leaderboard.js',
    './src/tutorial.js',
    './src/vitals.js',
    './src/skins/skinRegistry.js',
    './src/skins/skinStore.js',
    './src/ai/pathfinding.js',
    './src/ai/botController.js',
    './src/audio/synthAudio.js',
    './src/quests/questManager.js',
    './src/share/scoreExporter.js',
    './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // Fallback match for extensionless routes (/instructions or /blog)
            const requestUrl = new URL(event.request.url);
            const pathname = requestUrl.pathname;

            if (!pathname.endsWith('.html') && !pathname.endsWith('.js') && !pathname.endsWith('.css') && !pathname.endsWith('.webmanifest')) {
                const altPath = pathname + '.html';
                return caches.match(altPath).then((altMatch) => {
                    if (altMatch) return altMatch;
                    return fetch(event.request);
                });
            }

            return fetch(event.request);
        }).catch(() => fetch(event.request))
    );
});
