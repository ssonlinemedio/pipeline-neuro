// ============================================================
// SERVICE WORKER v15.0 - NEURO CACHE OPTIMIZADO
// ============================================================

const CACHE_NAME = 'pipeline-neuro-v15.0';
const OFFLINE_CACHE = 'pipeline-offline-v15.0';
const DYNAMIC_CACHE = 'pipeline-dynamic-v15.0';

// Assets estáticos para cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/database.js',
    '/js/vigia.js',
    '/js/centinela.js',
    '/js/pipeline.js',
    '/js/gramatica.js',
    '/js/ui.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Assets para modo offline
const OFFLINE_ASSETS = [
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/database.js',
    '/js/vigia.js',
    '/js/centinela.js',
    '/js/pipeline.js',
    '/js/gramatica.js',
    '/js/ui.js',
    '/manifest.json'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // Cache estático
            caches.open(CACHE_NAME)
                .then((cache) => {
                    console.log('📦 Service Worker: Cacheando assets estáticos');
                    return cache.addAll(STATIC_ASSETS);
                })
                .catch(err => console.warn('⚠️ Error cacheando estáticos:', err)),
            
            // Cache offline
            caches.open(OFFLINE_CACHE)
                .then((cache) => {
                    console.log('📦 Service Worker: Cacheando assets offline');
                    return cache.addAll(OFFLINE_ASSETS);
                })
                .catch(err => console.warn('⚠️ Error cacheando offline:', err))
        ])
        .then(() => self.skipWaiting())
    );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eliminar caches antiguas
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== OFFLINE_CACHE && 
                        cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Service Worker: Eliminando cache antigua', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker: Activado y listo');
            return self.clients.claim();
        })
    );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // ===== ESTRATEGIA: API y GROQ =====
    if (url.pathname.includes('/api/') || url.hostname.includes('groq.com')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cachear respuestas exitosas para offline
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Respuesta offline para API
                    return new Response(JSON.stringify({
                        error: 'offline',
                        message: 'Sin conexión a internet',
                        neuroMode: true,
                        timestamp: Date.now()
                    }), {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // ===== ESTRATEGIA: IMÁGENES Y ARCHIVOS ESTÁTICOS =====
    if (request.destination === 'image' || 
        request.destination === 'font' ||
        request.destination === 'style' ||
        request.destination === 'script') {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request)
                        .then(response => {
                            const clone = response.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, clone));
                            return response;
                        })
                        .catch(() => {
                            // Fallback para imágenes
                            if (request.destination === 'image') {
                                return new Response('', {
                                    status: 200,
                                    statusText: 'OK',
                                    headers: { 'Content-Type': 'image/svg+xml' }
                                });
                            }
                            return new Response('Offline', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
        return;
    }

    // ===== ESTRATEGIA: HTML (Cache First con Network Fallback) =====
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        // Actualizar en background
                        fetch(request)
                            .then(response => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then(cache => cache.put(request, response));
                                }
                            })
                            .catch(() => {});
                        return cachedResponse;
                    }
                    return fetch(request)
                        .then(response => {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, clone));
                            return response;
                        })
                        .catch(() => {
                            return caches.match('/index.html');
                        });
                })
        );
        return;
    }

    // ===== ESTRATEGIA: OTROS (Network First con Cache Fallback) =====
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cachear respuesta si es exitosa
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Fallback final
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// ===== MENSAJES =====
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(DYNAMIC_CACHE)
            .then(() => {
                console.log('🗑️ Cache dinámica eliminada');
                event.ports[0]?.postMessage({ success: true });
            })
            .catch(err => {
                console.error('❌ Error eliminando cache:', err);
                event.ports[0]?.postMessage({ success: false, error: err.message });
            });
    }
});

// ===== NOTIFICACIONES PUSH =====
self.addEventListener('push', (event) => {
    const data = event.data?.json() || { title: '📚 Pipeline Neuro', body: '¡Tiempo de estudiar!' };
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [200, 100, 200],
            data: data.url || '/',
            actions: [
                { action: 'study', title: '📖 Estudiar' },
                { action: 'dismiss', title: 'Cerrar' }
            ]
        })
    );
});

// ===== ACCIÓN DE NOTIFICACIONES =====
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'study') {
        event.waitUntil(
            clients.openWindow('/?action=study')
        );
    } else {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

// ===== GESTIÓN DE ACTUALIZACIONES =====
self.addEventListener('updatefound', () => {
    console.log('🔄 Service Worker: Nueva versión encontrada');
});

// ===== MODO OFFLINE DETECTADO =====
self.addEventListener('fetch', (event) => {
    // Detectar si estamos offline y notificar
    if (!navigator.onLine) {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'OFFLINE',
                    timestamp: Date.now()
                });
            });
        });
    }
});