import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendDateNotificationEmail } from "@/lib/email";

export async function POST(request) {
  console.log("Starting save-planner endpoint");
  try {
    const dateData = await request.json();
    console.log("Received date data:", dateData);

    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("Connected to database successfully");

    const collection = db.collection("dates");
    console.log("Using collection: dates");

    // Update or insert the date for the current week
    const result = await collection.updateOne(
      { week: dateData.week },
      {
        $set: {
          ...dateData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("Database operation result:", result);

    // Send email notification
    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
      try {
        await sendDateNotificationEmail(
          dateData,
          dateData.partnerA,
          dateData.partnerB,
          dateData.week
        );
        console.log("Email notification sent successfully");
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // We don't want to fail the save operation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Date saved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Detailed error in save-planner:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Failed to save date",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
