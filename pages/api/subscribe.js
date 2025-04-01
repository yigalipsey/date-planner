import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ message: "Subscription is required" });
    }

    // Connect to MongoDB
    await connectDB();

    // Save the subscription
    await Subscription.create({ subscription });

    res.status(201).json({ message: "Subscription saved successfully" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ message: "Error saving subscription" });
  }
}
