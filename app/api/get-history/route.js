import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    console.log("Starting get-history endpoint");
    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    // Get all dates from the main collection, sorted by week number (descending)
    const dates = await collection
      .find({ isPlanned: true }) // Only get planned dates
      .sort({ week: -1 }) // Sort by week number, newest first
      .toArray();

    console.log(`Found ${dates.length} dates in history`);

    return NextResponse.json({
      success: true,
      history: dates,
    });
  } catch (error) {
    console.error("Error getting history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get history",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
