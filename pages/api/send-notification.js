import webpush from "web-push";
import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

// Initialize web-push with your VAPID keys
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { title, message } = req.body;

    // Connect to MongoDB
    await connectDB();

    // Get all subscriptions from MongoDB
    const subscriptions = await Subscription.find({});

    const notifications = subscriptions.map(({ subscription }) =>
      webpush.sendNotification(
        subscription,
        JSON.stringify({
          title,
          body: message,
          icon: "/icons/android-chrome-192x192.png",
          badge: "/icons/notification-badge.png",
          vibrate: [200, 100, 200],
          tag: "date-planner",
          actions: [
            {
              action: "open",
              title: "פתח אפליקציה",
            },
          ],
        })
      )
    );

    await Promise.all(notifications);

    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ message: "Error sending notifications" });
  }
}
