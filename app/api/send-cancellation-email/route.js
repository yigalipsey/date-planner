import { Resend } from "resend";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { week, partnerA, partnerB } = await request.json();

    // Get the date details from the database before it's deleted
    const { db } = await connectToDatabase();
    const collection = db.collection("dates");
    const dateDetails = await collection.findOne({ week });

    const { data, error } = await resend.emails.send({
      from: "דייטי <noreply@yigalipsey.com>",
      to: [process.env.PARTNER_A_EMAIL, process.env.PARTNER_B_EMAIL],
      subject: "ביטול דייט",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">היי ${partnerA} ו-${partnerB} 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            הדייט של שבוע ${week} בוטל.
          </p>
          ${
            dateDetails
              ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
              <strong>פרטי הדייט שבוטל:</strong><br/>
              ${dateDetails.dateDetails}<br/>
              <strong>מיקום:</strong> ${dateDetails.location}
            </p>
          </div>
          `
              : ""
          }
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            אתם מוזמנים לתכנן דייט חדש בכל זמן שתרצו.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            אהבה ❤️
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending cancellation email:", error);
      return NextResponse.json(
        { error: "Failed to send cancellation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in send-cancellation-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
