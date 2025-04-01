self.addEventListener("push", function (event) {
  console.log("Push event received");

  try {
    const data = event.data.json();
    console.log("Received notification data:", data);

    const options = {
      body: data.body,
      icon: data.icon || "/icons/android-chrome-192x192.png",
      badge: data.badge || "/icons/notification-badge.png",
      vibrate: data.vibrate || [200, 100, 200],
      tag: data.tag || "date-planner",
      actions: data.actions || [
        {
          action: "open",
          title: "פתח אפליקציה",
        },
      ],
      data: data.data || {},
      requireInteraction: true,
      renotify: true,
    };

    console.log("Showing notification with options:", options);

    event.waitUntil(
      self.registration
        .showNotification(data.title, options)
        .then(() => console.log("Notification shown successfully"))
        .catch((error) => console.error("Error showing notification:", error))
    );
  } catch (error) {
    console.error("Error processing push event:", error);
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";
    console.log("Opening URL:", urlToOpen);

    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

self.addEventListener("install", function (event) {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activated");
  event.waitUntil(clients.claim());
});
