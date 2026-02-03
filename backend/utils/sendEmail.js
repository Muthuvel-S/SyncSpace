import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM, // must be verified in SendGrid
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error(
      "❌ SendGrid email error:",
      error.response?.body || error.message
    );
  }
};

export default sendEmail;
