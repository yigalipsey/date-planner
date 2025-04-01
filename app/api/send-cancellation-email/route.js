import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { week, partnerA, partnerB } = await request.json();

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
