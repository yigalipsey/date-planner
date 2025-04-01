import webpush from "web-push";
import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

// Initialize web-push with your VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error("VAPID keys are missing!");
}

webpush.setVapidDetails(
  "mailto:yigaldev@gmail.com", // Your email
  vapidPublicKey,
  vapidPrivateKey
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { title, message } = req.body;
    console.log("Attempting to send notification:", { title, message });

    // Connect to MongoDB
    await connectDB();

    // Get all subscriptions from MongoDB
    const subscriptions = await Subscription.find({});
    console.log(`Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      return res.status(404).json({
        message: "No active subscriptions found",
        error: "No subscribers",
      });
    }

    const notificationPromises = [];
    const expiredSubscriptions = [];

    // Try to send notification to each subscription
    for (const { _id, subscription } of subscriptions) {
      try {
        console.log("Sending notification to subscription:", _id);
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
        console.log("Successfully sent notification to:", _id);
      } catch (error) {
        if (error.statusCode === 410) {
          console.log("Subscription expired for:", _id);
          expiredSubscriptions.push(_id);
        } else {
          console.error(
            "Error sending notification to " + _id + ":",
            error.message
          );
        }
      }
    }

    // Remove expired subscriptions
    if (expiredSubscriptions.length > 0) {
      console.log(
        `Removing ${expiredSubscriptions.length} expired subscriptions`
      );
      await Subscription.deleteMany({ _id: { $in: expiredSubscriptions } });
    }

    const successCount = subscriptions.length - expiredSubscriptions.length;
    console.log(`Successfully sent ${successCount} notifications`);

    res.status(200).json({
      message: "Notifications processed",
      sent: successCount,
      expired: expiredSubscriptions.length,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Error in notification process:", error);
    res.status(500).json({
      message: "Error processing notifications",
      error: error.message,
    });
  }
}
