import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        message: "Invalid subscription object",
        received: subscription,
      });
    }

    console.log(
      "Received subscription:",
      JSON.stringify(subscription, null, 2)
    );

    // Connect to MongoDB
    await connectDB();

    // Check if this endpoint already exists
    const existing = await Subscription.findOne({
      "subscription.endpoint": subscription.endpoint,
    });

    if (existing) {
      console.log("Subscription already exists for this endpoint");
      return res.status(200).json({ message: "Subscription already exists" });
    }

    // Save the subscription
    const newSubscription = await Subscription.create({
      subscription: {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        expirationTime: subscription.expirationTime,
      },
    });

    console.log("Saved subscription:", newSubscription._id);

    res.status(201).json({
      message: "Subscription saved successfully",
      subscriptionId: newSubscription._id,
    });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({
      message: "Error saving subscription",
      error: error.message,
    });
  }
}
