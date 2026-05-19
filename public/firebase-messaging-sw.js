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
          title: 'SkinPersona Daily Check-in',
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
      { action: 'applied', title: '✅ Applied' },
      { action: 'later', title: '⏰ Remind me later' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notification.title || 'SkinPersona', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};

  if (event.action === 'applied' && data.jobId) {
    event.waitUntil(
      fetch('/api/checkin/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: data.jobId, responded: true })
      })
    );
  } else if (data.checkInUrl) {
    event.waitUntil(
      clients.openWindow(data.checkInUrl)
    );
  }
});
