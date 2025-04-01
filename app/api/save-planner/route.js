import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendDateNotificationEmail } from "@/lib/email";

export async function POST(request) {
  console.log("Starting save-planner endpoint");
  try {
    const { week, dateDetails, location, isPlanned, partnerA, partnerB } =
      await request.json();

    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("Connected to database successfully");

    const collection = db.collection("dates");
    const historyCollection = db.collection("dates_history");
    console.log("Using collections: dates and dates_history");

    // If isPlanned is false, delete the date
    if (!isPlanned) {
      const deleteResult = await collection.deleteOne({ week });
      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          { error: "Date not found to delete" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // For planned dates, update or insert
    const result = await collection.updateOne(
      { week },
      {
        $set: {
          dateDetails,
          location,
          isPlanned,
          planningDate: new Date(),
          partnerA,
          partnerB,
        },
      },
      { upsert: true }
    );

    console.log("Database operation result:", result);

    // Send email notification for new or updated dates
    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
      try {
        const emailResult = await sendDateNotificationEmail(
          dateDetails,
          partnerA,
          partnerB,
          week
        );
        console.log("Email notification result:", emailResult);
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in save-planner:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
