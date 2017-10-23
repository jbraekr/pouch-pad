console.log('sourcelink');

var CACHE_NAME = 'pouch-pad-v1';
var urlsToCache = [
    "https://cdn.jsdelivr.net/pouchdb/latest/pouchdb.min.js",
    "https://aframe.io/releases/0.7.0/aframe.min.js",
    "https://cdn.aframe.io/fonts/Roboto-msdf.json",
    "https://cdn.aframe.io/fonts/Roboto-msdf.png","https://unpkg.com/aframe-inspector@0.7.x/dist/aframe-inspector.min.js",
];

self.addEventListener('install', function (event) {
    console.log(CACHE_NAME,urlsToCache);
    self.skipWaiting();
    // Perform install steps
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
    }, function (err) {
        console.log(err);
    }));
});

self.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request).then(function (response) {
        // Cache hit - return response
        if (response) {
            console.log("cached", event.request.url);
            return response;
        }
        if(!/\/db\/kittens/.test(event.request.url)) console.log("uncached " + event.request.url);
        return fetch(event.request);
    }, function (err) {
        console.log(err);
    }));
});

self.addEventListener('activate', function (event) {

    console.log("cache " + CACHE_NAME);
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log("deleting cache " + cacheName)
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});//