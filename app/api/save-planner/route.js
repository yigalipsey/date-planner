import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendDateNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { week, dateDetails, location, partnerA, partnerB } = body;

    if (!week || !dateDetails || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    // Check if a date already exists for this week
    const existingDate = await collection.findOne({ week: parseInt(week) });
    if (existingDate) {
      return NextResponse.json(
        { error: "A date already exists for this week" },
        { status: 400 }
      );
    }

    // Create new date document
    const date = {
      week: parseInt(week),
      dateDetails,
      location,
      partnerA,
      partnerB,
      status: "planned",
      createdAt: new Date(),
    };

    // Save to database
    await collection.insertOne(date);

    // Send email notification
    await sendDateNotificationEmail(date);

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error("Error saving date:", error);
    return NextResponse.json({ error: "Failed to save date" }, { status: 500 });
  }
}
