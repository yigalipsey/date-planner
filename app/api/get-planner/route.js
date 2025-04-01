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

    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    const date = await collection.findOne({ week: week });

    return Response.json({
      success: true,
      date: date || null,
    });
  } catch (error) {
    console.error("Error in get-planner:", error);
    return Response.json({
      success: false,
      message: error.message || "Failed to fetch date",
    });
  }
}
