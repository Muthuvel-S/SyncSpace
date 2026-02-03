import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📧 Sending email to:", to);
    console.log("📧 Using EMAIL_USER:", process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SyncSpace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};


export default sendEmail;
