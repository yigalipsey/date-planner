import connectDB from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    res.status(200).json({ message: "Successfully connected to MongoDB!" });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res
      .status(500)
      .json({ message: "Failed to connect to MongoDB", error: error.message });
  }
}
