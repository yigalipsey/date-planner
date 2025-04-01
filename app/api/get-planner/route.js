import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get("week"));

    if (!week) {
      return Response.json({
        success: false,
        message: "Week parameter is required",
      });
    }

    // Add timeout to the database operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database operation timed out")), 8000)
    );

    const dbOperation = async () => {
      const { db } = await connectToDatabase();
      const collection = db.collection("dates");
      return await collection.findOne({ week: week });
    };

    // Race between the database operation and timeout
    const date = await Promise.race([dbOperation(), timeoutPromise]);

    return Response.json({
      success: true,
      date: date || null,
    });
  } catch (error) {
    console.error("Error in get-planner:", error);
    const errorMessage =
      error.message === "Database operation timed out"
        ? "Request timed out - please try again"
        : error.message || "Failed to fetch date";

    return Response.json({
      success: false,
      message: errorMessage,
    });
  }
}
