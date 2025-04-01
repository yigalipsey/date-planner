import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendDateNotificationEmail(
  dateDetails,
  partnerA,
  partnerB,
  weekNumber
) {
  const recipients = [process.env.PARTNER_A_EMAIL, process.env.PARTNER_B_EMAIL];

  const hebrewDate = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailText = `
    היי ${partnerA} ו-${partnerB}! 🎉
    
    דייט חדש תוכנן לשבוע ${weekNumber}!
    
    פרטי הדייט:
    ${dateDetails.dateDetails}
    
    מיקום: ${dateDetails.location}
    
    תאריך התכנון: ${hebrewDate}
    
    מתכנן/ת השבוע: ${dateDetails.week % 2 === 0 ? partnerA : partnerB}
    
    שיהיה בהצלחה! 💑
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.join(", "),
      subject: `דייט חדש תוכנן לשבוע ${weekNumber}! 🎉`,
      text: emailText,
      html: emailText.replace(/\n/g, "<br>"),
    });

    console.log("Date notification email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending date notification email:", error);
    return false;
  }
}
