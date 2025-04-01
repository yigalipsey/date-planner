import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { client } = await connectToDatabase();
    // Try to ping the database
    await client.db().command({ ping: 1 });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Database connection check failed:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
