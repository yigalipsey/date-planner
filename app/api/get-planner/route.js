import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get("week"));

    if (!week) {
      return NextResponse.json(
        { error: "Week parameter is required" },
        { status: 400 }
      );
    }

    console.log("Fetching date for week:", week);
    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    const dateData = await collection.findOne({ week: week });
    console.log("Found date data:", dateData);

    return NextResponse.json({ date: dateData });
  } catch (error) {
    console.error("Error getting date:", error);
    return NextResponse.json({ error: "Failed to get date" }, { status: 500 });
  }
}
