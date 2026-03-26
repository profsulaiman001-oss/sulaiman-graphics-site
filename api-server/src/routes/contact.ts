import { Router, type Request, type Response } from "express";
import nodemailer from "nodemailer";

const router = Router();

/* ── Shared transporter (lazy-init) ───────────────────────────── */
function buildTransporter() {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/* ── POST /api/contact ─────────────────────────────────────────── */
router.post("/contact", async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const transporter = buildTransporter();

  if (!transporter) {
    /* Credentials not set — still acknowledge gracefully */
    console.warn("Email credentials not configured. Contact form submission received:", {
      name,
      email,
      subject,
    });
    res.json({ success: true, message: "Message received." });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Sulaiman Graphics — Portfolio" <${process.env["GMAIL_USER"]}>`,
      to: "profsulaiman001@gmail.com",
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#e5e5e5;border-radius:12px;">
          <h2 style="color:#3b82f6;margin-bottom:4px;">New Contact Message</h2>
          <p style="color:#888;font-size:14px;margin-top:0;">via Sulaiman Graphics Portfolio</p>
          <hr style="border-color:#222;margin:20px 0"/>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#3b82f6;">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border-color:#222;margin:20px 0"/>
          <p style="white-space:pre-line;">${message}</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
});

/* ── POST /api/subscribe ───────────────────────────────────────── */
router.post("/subscribe", async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const transporter = buildTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Sulaiman Graphics" <${process.env["GMAIL_USER"]}>`,
        to: "profsulaiman001@gmail.com",
        subject: "New Newsletter Subscriber",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#e5e5e5;border-radius:12px;">
            <h2 style="color:#3b82f6;">New Subscriber</h2>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#3b82f6;">${email}</a></p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Subscriber notification error:", err);
      /* Non-blocking — still confirm to user */
    }
  } else {
    console.log("New subscriber (email not sent — credentials not set):", email);
  }

  res.json({ success: true, message: "Thanks for subscribing!" });
});

export default router;
