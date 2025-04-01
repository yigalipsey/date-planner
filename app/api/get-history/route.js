import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    // Get all planned dates, sorted by week number in descending order
    const dates = await collection
      .find({ status: "planned" })
      .sort({ week: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      history: dates,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch date history",
      },
      { status: 500 }
    );
  }
}
