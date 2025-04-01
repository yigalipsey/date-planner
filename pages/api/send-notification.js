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

    const results = [];

    // Try to send notification to each subscription
    for (const { _id, subscription } of subscriptions) {
      try {
        console.log("Attempting to send to subscription:", _id.toString());
        console.log(
          "Subscription details:",
          JSON.stringify(subscription, null, 2)
        );

        const payload = JSON.stringify({
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
          data: {
            url: "https://date-planner-yigal.vercel.app/", // Add your app URL here
          },
        });

        await webpush.sendNotification(subscription, payload);
        console.log("Successfully sent notification to:", _id.toString());
        results.push({ id: _id.toString(), status: "success" });
      } catch (error) {
        console.error(
          `Error sending notification to ${_id.toString()}:`,
          error.message,
          error.statusCode
        );
        results.push({
          id: _id.toString(),
          status: "error",
          code: error.statusCode,
          message: error.message,
        });

        if (error.statusCode === 410) {
          console.log("Subscription expired for:", _id.toString());
          await Subscription.deleteOne({ _id });
        }
      }
    }

    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;

    res.status(200).json({
      message: "Notifications processed",
      results,
      summary: {
        total: subscriptions.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Error in notification process:", error);
    res.status(500).json({
      message: "Error processing notifications",
      error: error.message,
    });
  }
}
