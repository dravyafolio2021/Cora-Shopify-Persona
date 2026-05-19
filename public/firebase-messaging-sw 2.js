self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const notification = data.notification || {};
  const payload = data.data || {};

  const options = {
    body: notification.body,
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
  const data = event.notification.data;

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
