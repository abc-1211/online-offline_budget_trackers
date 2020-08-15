const cacheName = "v1";
const Data_catcheName = "API_v1";

// Call install event
self.addEventListener("install", (event) => {
});

// Activate
self.addEventListener("activate", (event) => {
    // Remove unwanted caches
    event.waitUntil(
        caches.keys().then(cacheName => {
            return Promise.all(
                cacheName.map(cache => {
                    if (cache !== cacheName) {
                        return caches.delete(cache);
                    }
                })
            )
        })
    );
});

// Fetch
self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")){
        event.respondWith(
            caches.open(Data_catcheName)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            return cache.match(event.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    event.respondWith(
        fetch(event.request)
        .then(res => {
            // Make clone of response
            const resClone = res.clone();
            // Open Cache
            caches
                .open(cacheName)
                .then(cache => {
                    // Add response to cache
                    cache.put(event.request, resClone);
                });
            return res;
        })
        .catch(err => {
            caches.match(event.request)
                .then(res => res)
        })
    )

})