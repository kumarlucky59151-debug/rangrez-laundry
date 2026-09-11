// firebase-messaging-sw.js
// MUST live at the SITE ROOT — same folder as index.html/admin.html — for push
// notifications to work (a service worker can only control paths at or below its own
// location, so /some/subfolder/firebase-messaging-sw.js would NOT be able to catch
// pushes for the whole site).
//
// This file cannot read your firebase-config.js (service workers run in an isolated
// context), so copy the SAME config values you already used in firebase-config.js here.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Shown when the admin panel tab/browser is fully closed or the device is asleep.
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  const title = 'New booking received!';
  const body = `${data.customerName || 'Customer'} — ${data.bookingType === 'HOTEL' ? (data.hotelName || 'Hotel guest') : 'Regular pickup'} — ₹${data.grandTotal || 0}`;

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico', // replace with your logo path if you have one at the site root
    tag: data.bookingDocId || 'new-booking',
    data: { url: '/admin.html' },
    vibrate: [200, 100, 200]
  });
});

// Tapping the push notification opens (or focuses) the admin panel.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('admin.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
