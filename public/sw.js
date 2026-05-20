// public/sw.js
// Sulaiman Graphics - Realtime Background Push Notification Service Worker

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || "You have an update on your dashboard matrix.",
      icon: data.icon || "/favicon.ico", 
      badge: data.badge || "/favicon.ico",
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/dashboard"
      },
      actions: [
        { action: "open", title: "View Matrix Desk" }
      ],
      tag: data.tag || "studio-update",
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Sulaiman Graphics", options)
    );
  } catch (err) {
    // Fallback if data is raw text instead of structured JSON object
    const options = {
      body: event.data.text(),
      icon: "/favicon.ico",
      vibrate: [200, 100, 200],
      data: { url: "/dashboard" }
    };
    
    event.waitUntil(
      self.registration.showNotification("Sulaiman Graphics Update", options)
    );
  }
});

// Handle when the user clicks the home screen banner notification card
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  let targetUrl = "/dashboard";
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If a browser tab is already open on our site, bring it to focus
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a fresh window straight to the dashboard or chat room
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
