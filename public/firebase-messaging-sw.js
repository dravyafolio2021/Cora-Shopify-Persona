self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn('Failed to parse push data as JSON, using plain text fallback:', e);
    try {
      data = {
        notification: {
          title: 'Cora Daily Check-in',
          body: event.data ? event.data.text() : 'Time for your daily routine!'
        }
      };
    } catch (err) {
      data = {};
    }
  }

  const notification = data.notification || {};
  const payload = data.data || {};

  const options = {
    body: notification.body || 'Time for your skincare check-in!',
    icon: notification.icon || '/icon-192x192.png',
    data: payload,
    actions: [
      { action: 'yes', title: 'Yes, Done' },
      { action: 'no', title: 'Not Yet' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notification.title || 'Cora', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};

  if ((event.action === 'yes' || event.action === 'no') && data.jobId) {
    const responded = event.action === 'yes';
    event.waitUntil(
      fetch('/api/store/campaigns/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: data.jobId, responded: responded })
      })
    );
  } else if (data.checkInUrl) {
    event.waitUntil(
      clients.openWindow(data.checkInUrl)
    );
  }
});
