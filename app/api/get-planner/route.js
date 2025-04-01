import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");

    if (!week) {
      return NextResponse.json(
        { error: "Week parameter is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    // Find the date for the specified week
    const date = await collection.findOne({ week: parseInt(week) });

    if (!date) {
      return NextResponse.json({ date: null });
    }

    return NextResponse.json({ date });
  } catch (error) {
    console.error("Error in get-planner:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch date",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
