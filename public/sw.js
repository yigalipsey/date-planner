self.addEventListener("push", function (event) {
  const options = event.data.json();

  event.waitUntil(
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      vibrate: options.vibrate,
      tag: options.tag,
      actions: options.actions,
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow("/"));
  }
});
