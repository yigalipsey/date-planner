import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDateNotificationEmail(
  dateDetails,
  partnerA,
  partnerB,
  week,
  location
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "דייטי <noreply@yigalipsey.com>",
      to: [process.env.PARTNER_A_EMAIL, process.env.PARTNER_B_EMAIL],
      subject: `דייט חדש תוכנן לשבוע הזה - שבוע ${week}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">היי ${partnerA} ו-${partnerB} 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            דייט חדש תוכנן לשבוע ${week}!
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
              <strong>פרטי הדייט:</strong><br/>
              ${dateDetails}<br/>
              <strong>מיקום:</strong> ${location || "הפתעה"}
            </p>
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            מתכנן/ת השבוע: ${week % 2 === 0 ? partnerA : partnerB}
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            אהבה ❤️
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending date notification email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in sendDateNotificationEmail:", error);
    throw error;
  }
}
