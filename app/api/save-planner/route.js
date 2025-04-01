import { connectToDatabase } from "@/lib/mongodb";
import { sendDateNotificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { week, dateDetails, location, isPlanned, partnerA, partnerB } =
      await req.json();

    const { db } = await connectToDatabase();
    const collection = db.collection("dates");

    // Update or insert the date
    const result = await collection.updateOne(
      { week: week },
      {
        $set: {
          dateDetails,
          location,
          isPlanned,
          partnerA,
          partnerB,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Send email notification for new or updated dates
    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
      try {
        await sendDateNotificationEmail(
          dateDetails,
          partnerA,
          partnerB,
          week,
          location
        );
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }
    }

    // Save to history collection
    const historyCollection = db.collection("dates_history");
    await historyCollection.insertOne({
      week,
      dateDetails,
      location,
      isPlanned,
      partnerA,
      partnerB,
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      message: "Date saved successfully",
    });
  } catch (error) {
    console.error("Error in save-planner:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to save date",
      },
      { status: 500 }
    );
  }
}
