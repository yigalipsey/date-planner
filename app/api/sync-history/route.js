import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request) {
  try {
    console.log("Starting history sync");
    const { db } = await connectToDatabase();
    const collection = db.collection("dates");
    const historyCollection = db.collection("dates_history");

    // Get all dates from main collection
    const dates = await collection.find({}).toArray();
    console.log(`Found ${dates.length} dates to sync`);

    let syncCount = 0;
    for (const date of dates) {
      // Check if date already exists in history
      const existingHistory = await historyCollection.findOne({
        week: date.week,
      });
      if (!existingHistory) {
        // Add to history if not exists
        await historyCollection.insertOne({
          ...date,
          type: "created",
          createdAt: date.createdAt || new Date(),
          updatedAt: date.updatedAt || new Date(),
        });
        syncCount++;
      }
    }

    console.log(`Synced ${syncCount} dates to history`);
    return NextResponse.json({
      success: true,
      message: `Synced ${syncCount} dates to history`,
      syncedCount: syncCount,
    });
  } catch (error) {
    console.error("Error syncing history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync history",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
