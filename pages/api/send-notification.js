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
    const notificationPromises = [];
    const expiredSubscriptions = [];

    // Try to send notification to each subscription
    for (const { _id, subscription } of subscriptions) {
      try {
        await webpush.sendNotification(
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
        );
      } catch (error) {
        if (error.statusCode === 410) {
          // Subscription has expired
          expiredSubscriptions.push(_id);
        } else {
          console.error("Error sending notification:", error);
        }
      }
    }

    // Remove expired subscriptions
    if (expiredSubscriptions.length > 0) {
      await Subscription.deleteMany({ _id: { $in: expiredSubscriptions } });
    }

    res.status(200).json({
      message: "Notifications processed",
      sent: subscriptions.length - expiredSubscriptions.length,
      expired: expiredSubscriptions.length,
    });
  } catch (error) {
    console.error("Error in notification process:", error);
    res.status(500).json({ message: "Error processing notifications" });
  }
}
