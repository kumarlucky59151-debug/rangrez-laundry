// Rangrez Laundry — service worker
//
// Scope, deliberately narrow: this caches the STATIC APP SHELL ONLY (the HTML
// document, fonts, the icon) so a repeat visit paints faster and a full
// offline load shows the site shell instead of the browser's own "no
// internet" page. It never touches anything that could show stale or unsafe
// data:
//   - Firestore reads (pricing, offers, bookings, site content) are never
//     cached — those must always be live, or the customer could see wrong
//     prices, stale offers, or (worse) someone else's booking state.
//   - Razorpay's checkout script and any googleapis.com/firestore traffic are
//     explicitly excluded, not just "not currently cached" — see the origin
//     check below.
//   - Nothing is ever cached for a non-GET request, so a payment or booking
//     POST/callable is never at risk of being served from cache.
//
// Bump CACHE_NAME on any app-shell change (a new icon, a font swap) so
// visitors actually get the update instead of an old cached shell.
const CACHE_NAME = 'rangrez-shell-v1';
const SHELL_URLS = ['/index.html', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never intercept writes/payments/callables

  const url = new URL(req.url);
  const isOwnOrigin = url.origin === self.location.origin;
  // Fonts are the one cross-origin exception — safe to cache, never change
  // per-request, and caching them is most of the point of an app shell.
  const isCacheableFont = url.hostname === 'fonts.gstatic.com';
  if (!isOwnOrigin && !isCacheableFont) return; // Firestore, Razorpay, EmailJS, Font Awesome CDN, etc. — always network, never cached

  if (req.mode === 'navigate') {
    // Network-first for the page itself: a visitor with a connection always
    // gets the current site; only a genuinely offline visitor sees the last
    // cached shell (its Firestore-driven sections will simply show their
    // existing loading/empty states, since those calls will fail offline —
    // this is a shell fallback, not an offline-data experience).
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static own-origin assets and the whitelisted font host: cache-first, fall
  // back to network and quietly cache what comes back.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      return res;
    }))
  );
});
