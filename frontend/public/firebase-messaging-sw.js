// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD_-gzF_teGesqiatyF6p9fvjg0eoAQOlc",
  authDomain: "ott-detection-adabc.firebaseapp.com",
  projectId: "ott-detection-adabc",
  storageBucket: "ott-detection-adabc.firebasestorage.app",
  messagingSenderId: "785216903458",
  appId: "1:785216903458:web:28f6c37c4bfa19ff442d7b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'SubTracker';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: payload.data,
    vibrate: [200, 100, 200],
    tag: 'subscription-notification',
    renotify: true,
    actions: [
      { action: 'yes', title: 'Yes' },
      { action: 'no', title: 'No' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'yes' || action === 'no') {
    // Handle yes/no response
    console.log('User responded:', action, data);
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/dashboard');
    })
  );
});
