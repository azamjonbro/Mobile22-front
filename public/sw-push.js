// Push Notification Event Listener
self.addEventListener('push', function (event) {
  let data = { title: 'CRM Ogohlantirish', body: 'Yangi bildirishnoma keldi!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'CRM Ogohlantirish', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      { action: 'explore', title: 'CRM-ni ochish' },
      { action: 'close', title: 'Yopish' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event Listener
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
