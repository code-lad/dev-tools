if (workbox) {

  //Allow New Service-Worker Update
  workbox.skipWaiting();
  workbox.clientsClaim();

  // Workbox Precaching
  workbox.precaching.precacheAndRoute(self.__precacheManifest);
  workbox.routing.registerNavigationRoute('/index.html');

  //Workbox Cache Google-Fonts 
  workboxSW.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'google-fonts',
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30
    }
  }));

  //Workbox Cache Material Icons
  workboxSW.router.registerRoute('https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css', workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'material-icons'
  }));

  //Workbox caching Images
  workbox.routing.registerRoute(
    // Cache image files.
    /\.(?:png|jpg|jpeg|svg|gif)$/,
    // Use the cache if it's available.
    new workbox.strategies.CacheFirst({
      // Use a custom cache name.
      cacheName: 'cache-images',
      plugins: [
        new workbox.expiration.Plugin({
          // Cache only 20 images.
          maxEntries: 60,
          // Cache for a maximum of a week.
          maxAgeSeconds: 30 * 24 * 60 * 60,
        })
      ],
    })
  );

  //Workbox caching JS & CSS
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'cache-js-css',
    })
  );

  // Fetch event 
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
      .then(cacheResponse => (cacheResponse || fetch(event.request))),
    );
  });

  //This is how you can use the network first strategy for files ending with .js
  workbox.routing.registerRoute(
    /.*\.js/,
    workbox.strategies.networkFirst()
  )

  // Use cache but update cache files in the background ASAP
  workbox.routing.registerRoute(
    /.*\.css/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'css-cache'
    })
  )

  //Cache first, but defining duration and maximum files
  workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    workbox.strategies.cacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60
        })
      ]
    })
  )

  workbox.routing.registerRoute(
    new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst({
      cacheName: 'googleapis',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30
        })
      ]
    })
  )

}

// inside src/service-worker.js 

// define a prefix for your cache names. It is recommended to use your project name
workbox.core.setCacheNameDetails({
  prefix: "simple-vue-project"
});

// Start of Precaching##########################
// __precacheManifest is the list of resources you want to precache. This list will be generated and imported automatically by workbox during build time
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
// End of Precaching############################

// Start of CachFirst Strategy##################
// all the api request which matchs the following pattern will use CacheFirst strategy for caching
workbox.routing.registerRoute(
  /https:\/\/get\.geojs\.io\/v1\/ip\/country\.json/,
  new workbox.strategies.CacheFirst()
);
// End of CachFirst Strategy####################