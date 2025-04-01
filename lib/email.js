import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDateNotificationEmail(
  dateDetails,
  partnerA,
  partnerB,
  weekNumber
) {
  console.log("Sending date notification email...");
  const recipients = [process.env.PARTNER_A_EMAIL, process.env.PARTNER_B_EMAIL];
  console.log("Recipients:", recipients);

  const hebrewDate = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailHtml = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2b3481;">היי ${partnerA} ו-${partnerB}! 🎉</h2>
      
      <p style="font-size: 18px; margin-bottom: 20px;">
        דייט חדש תוכנן לשבוע ${weekNumber}!
      </p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #2b3481; margin-top: 0;">פרטי הדייט:</h3>
        <p style="font-size: 16px;">${dateDetails.dateDetails}</p>
        
        <h3 style="color: #2b3481;">מיקום:</h3>
        <p style="font-size: 16px;">${dateDetails.location}</p>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        תאריך התכנון: ${hebrewDate}<br>
        מתכנן/ת השבוע: ${dateDetails.week % 2 === 0 ? partnerA : partnerB}
      </p>
      
      <p style="font-size: 18px; color: #2b3481; text-align: center; margin-top: 30px;">
        שיהיה בהצלחה! 💑
      </p>
    </div>
  `;

  try {
    console.log("About to send email via Resend");
    const result = await resend.emails.send({
      from: "דייטי  <noreply@yigalipsey.com>",
      to: recipients,
      subject: `דייט חדש תוכנן לשבוע ${weekNumber}! 🎉`,
      html: emailHtml,
      text: `היי ${partnerA} ו-${partnerB}! 🎉\n\nדייט חדש תוכנן לשבוע ${weekNumber}!\n\nפרטי הדייט:\n${
        dateDetails.dateDetails
      }\n\nמיקום: ${
        dateDetails.location
      }\n\nתאריך התכנון: ${hebrewDate}\n\nמתכנן/ת השבוע: ${
        dateDetails.week % 2 === 0 ? partnerA : partnerB
      }\n\nשיהיה בהצלחה! 💑`,
    });

    console.log("Email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
