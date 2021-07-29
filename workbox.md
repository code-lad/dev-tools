# [Workbox](workboxjs.org) runtime caching recipes

Your Service Worker script will need to import in Workbox and initialize it before calling any of the routes documented in 
this write-up, similar to the below:

```js
importScripts('workbox-sw.prod.v1.3.0.js');
const workbox = new WorkboxSW();

// Placeholder array populated automatically by workboxBuild.injectManifest()
workbox.precache([]);
```

As a reminder, Workbox supports a number of different [runtime caching strategies](https://workboxjs.org/reference-docs/latest/module-workbox-runtime-caching.html).

## Cache all Google Fonts requests (up to a maximum of 30 cache entries)

Uses a [cacheFirst](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-falling-back-to-network) strategy.

```js
workbox.router.registerRoute('https://fonts.googleapis.com/(.*)',
  workbox.strategies.cacheFirst({
    cacheName: 'googleapis',
    cacheExpiration: {
      maxEntries: 30
    },
    cacheableResponse: {statuses: [0, 200]}
  })
);
```
[cacheableResponse](https://workboxjs.org/reference-docs/latest/module-workbox-cacheable-response.html) determines if something can be cached based on the response's status code. Above, the response will be cached if the response code is 0 or 200.

## Cache all images using an extension whitelist

Uses a [cacheFirst](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-falling-back-to-network) strategy.

```js
workbox.router.registerRoute(/\.(?:png|gif|jpg|svg)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'images-cache'
  })
);
```

## Cache all scripts and stylesheets using an extension whitelist

Uses a [staleWhileRevalidate](https://workboxjs.org/reference-docs/latest/module-workbox-runtime-caching.StaleWhileRevalidate.html#main) strategy.

```js
workbox.router.registerRoute(/\.(?:js|css)$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'static-resources'
  })
);
```

## Cache all requests from multiple origins

Uses a [staleWhileRevalidate](https://workboxjs.org/reference-docs/latest/module-workbox-runtime-caching.StaleWhileRevalidate.html#main) strategy. Here we're registering routes for anything from the googleapis.com and gstatic.com origins:

```js
workbox.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, 
workbox.strategies.staleWhileRevalidate());
```
I often like to keep separate cache names for each of the origins I'm caching requests for. Doing this could look like:

```js
workbox.router.registerRoute(/.*(?:googleapis)\.com.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'googleapis-cache'
  })
);

workbox.router.registerRoute(/.*(?:gstatic)\.com.*$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'gstatic-cache'
  })
);
```


## Cache all requests from a specific origin, limited to 50 entries. Purge entries in the cache once they're older than 5 minutes.

Uses a [cacheFirst](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-falling-back-to-network) strategy.

```js
workbox.router.registerRoute(
    'https://hacker-news.firebaseio.com/v0/*',
    workbox.strategies.cacheFirst({
        cacheName: 'stories',
        cacheExpiration: {
            maxEntries: 50,
            maxAgeSeconds: 300 // 5 minutes
        },
        cacheableResponse: {statuses: [0, 200]}
    })
);
```

## Cache all the resources from a specific subdirectory

Uses a [staleWhileRevalidate](https://workboxjs.org/reference-docs/latest/module-workbox-runtime-caching.StaleWhileRevalidate.html#main) strategy.

For a sub-directory `/static/`:

```js
workbox.router.registerRoute(/static/(.*), workbox.strategies.staleWhileRevalidate())
```

As you've probably guessed, most of the path matching for setting up these routes just involves getting the regex right.

## Register express style route paths (e.g /path/:foo)

```js
workbox.router.registerRoute('/items/:itemId',
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'cache-with-expiration',
    cacheExpiration: {
      maxEntries: 20,
      maxAgeSeconds: 120
    }
  })
);
```
