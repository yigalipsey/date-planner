import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request) {
  const startTime = Date.now();
  console.log("Starting get-planner request...");

  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get("week"));

    if (!week) {
      console.log("Missing week parameter");
      return Response.json({
        success: false,
        message: "Week parameter is required",
      });
    }

    console.log(`Fetching date for week ${week}...`);

    // Add timeout to the database operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        console.log("Database operation timed out after 20 seconds");
        reject(new Error("Database operation timed out"));
      }, 20000)
    );

    const dbOperation = async () => {
      console.log("Starting database operation...");
      const { db } = await connectToDatabase();
      const collection = db.collection("dates");
      const result = await collection.findOne({ week: week });
      console.log("Database operation completed");
      return result;
    };

    // Race between the database operation and timeout
    const date = await Promise.race([dbOperation(), timeoutPromise]);

    const totalTime = Date.now() - startTime;
    console.log(`Request completed in ${totalTime}ms`);

    return Response.json({
      success: true,
      date: date || null,
      responseTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("Error in get-planner:", {
      error: error.message,
      stack: error.stack,
      timeElapsed: totalTime,
    });

    const errorMessage =
      error.message === "Database operation timed out"
        ? "בקשה נכשלה - נסה שוב"
        : error.message || "שגיאה בטעינת הדייט";

    return Response.json({
      success: false,
      message: errorMessage,
      responseTime: totalTime,
    });
  }
}
