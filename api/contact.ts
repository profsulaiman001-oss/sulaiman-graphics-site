import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Email to you
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: subject || "New Message",
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting Sulaiman Graphics",
      text: `
Hi ${name},

Thank you for reaching out to Sulaiman Graphics.

We have received your message and will get back to you shortly.

Best regards,
Sulaiman Graphics
Creativity Without Limits
      `,
    });

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending message" });
  }
}
