import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Delete all subscriptions
    await Subscription.deleteMany({});

    res.status(200).json({
      message: "All subscriptions deleted successfully",
    });
  } catch (error) {
    console.error("Error resetting subscriptions:", error);
    res.status(500).json({
      message: "Error resetting subscriptions",
      error: error.message,
    });
  }
}
