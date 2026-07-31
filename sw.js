// Service Worker - PharmaFinance Pro PWA
// Version 1.0.0 - Offline First

const CACHE_NAME = 'pharmafinance-v1.0.0';
const APP_SHELL = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/db.js',
    '/js/calculations.js',
    '/js/export.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Installation - Cache l'application shell
self.addEventListener('install', (event) => {
    console.log('[SW] Installation en cours...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Mise en cache de l\'app shell');
                return cache.addAll(APP_SHELL);
            })
            .then(() => self.skipWaiting())
            .catch((err) => console.error('[SW] Erreur de cache:', err))
    );
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Stratégie: Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') return;
    
    // Ignorer les requêtes vers d'autres origines (API externes)
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Mettre à jour le cache en arrière-plan
                    fetchAndCache(event.request);
                    return cachedResponse;
                }
                
                // Pas dans le cache -> réseau
                return fetchAndCache(event.request);
            })
            .catch(() => {
                // Fallback pour la navigation HTML
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            })
    );
});

// Fonction utilitaire: Fetch et mise en cache
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        // Ne mettre en cache que les réponses valides
        if (response.ok && response.status === 200) {
            const clone = response.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, clone);
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Gestion des messages depuis l'app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                event.source.postMessage({ type: 'CACHE_CLEARED' });
            })
        );
    }
    
    // Synchronisation en arrière-plan (future implémentation)
    if (event.data && event.data.type === 'SYNC_DATA') {
        console.log('[SW] Demande de synchronisation reçue');
        event.source.postMessage({ type: 'SYNC_COMPLETE' });
    }
});

// Background Sync pour opérations hors ligne
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Future implémentation de synchronisation serveur
    console.log('[SW] Synchronisation des données...');
    return true;
}

// Notifications push (future implémentation)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nouvelle notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: data.data || {}
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'PharmaFinance Pro', options)
        );
    }
});
