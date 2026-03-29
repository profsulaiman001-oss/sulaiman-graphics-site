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
    // EMAIL TO YOU (Styled)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: subject || "New Message",
      html: `
      <div style="background:#000; padding:20px; font-family:Arial;">
        <div style="max-width:500px; margin:auto; background:#111; border-radius:10px; overflow:hidden;">

          <div style="background:#0d6efd; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">New Message</h2>
          </div>

          <div style="padding:20px; color:#fff;">
            <p><strong style="color:#0d6efd;">Name:</strong> ${name}</p>
            <p><strong style="color:#0d6efd;">Email:</strong> ${email}</p>
            <p><strong style="color:#0d6efd;">Message:</strong></p>
            <p>${message}</p>
          </div>

        </div>
      </div>
      `,
    });

    // AUTO-REPLY (Styled + Buttons + Tracking)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting Sulaiman Graphics",
      html: `
      <div style="background:#000; padding:20px; font-family:Arial;">
        <div style="max-width:500px; margin:auto; background:#111; border-radius:10px; overflow:hidden;">

          <div style="background:#0d6efd; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">Sulaiman Graphics</h2>
            <p style="margin:5px 0 0;">Creativity Without Limits</p>
          </div>

          <div style="padding:20px; color:#fff;">
            <p>Hi ${name},</p>

            <p>Thank you for reaching out to <strong style="color:#0d6efd;">Sulaiman Graphics</strong>.</p>

            <p>We have received your message and will get back to you shortly.</p>

            <br/>

            <!-- BUTTONS -->
            <div style="text-align:center; margin:20px 0;">
              
              <a href="https://www.sulaimangraphics.com.ng/?utm_source=email&utm_medium=autoreply&utm_campaign=portfolio"
                 style="display:inline-block; padding:12px 20px; margin:5px; background:#0d6efd; color:#fff; text-decoration:none; border-radius:5px;">
                 View Portfolio
              </a>

              <a href="https://wa.me/2349060410369?text=Hello%20Sulaiman%20Graphics&utm_source=email&utm_medium=autoreply&utm_campaign=whatsapp"
                 style="display:inline-block; padding:12px 20px; margin:5px; background:#25D366; color:#fff; text-decoration:none; border-radius:5px;">
                 Chat on WhatsApp
              </a>

            </div>

            <p>Best regards,<br/>
            <strong>Sulaiman Graphics</strong></p>
          </div>

          <div style="background:#000; text-align:center; padding:15px; font-size:12px; color:#aaa;">
            © 2026 Sulaiman Graphics
          </div>

        </div>
      </div>
      `,
    });

    return res.status(200).json({ message: "Message sent successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending message" });
  }
}
