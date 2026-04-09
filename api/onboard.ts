import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Send email to your client/mom
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Your Project Dashboard | Sulaiman Graphics",
      html: `
      <div style="background:#000; padding:20px; font-family:Arial;">
        <div style="max-width:500px; margin:auto; background:#111; border-radius:10px; overflow:hidden;">

          <div style="background:#0d6efd; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">Sulaiman Graphics</h2>
            <p style="margin:5px 0 0;">Project Portal Access</p>
          </div>

          <div style="padding:20px; color:#fff;">
            <p>Hello,</p>
            <p>You have been invited to access your project dashboard on Sulaiman Graphics.</p>
            <br/>
            <div style="text-align:center; margin:20px 0;">
              <a href="https://www.sulaimangraphics.com.ng/auth"
                 style="display:inline-block; padding:12px 20px; background:#0d6efd; color:#fff; text-decoration:none; border-radius:5px;">
                 Access Dashboard
              </a>
            </div>
          </div>

          <div style="background:#000; text-align:center; padding:15px; font-size:12px; color:#aaa;">
            © 2026 Sulaiman Graphics
          </div>

        </div>
      </div>
      `,
    });

    return res.status(200).json({ message: "Portal invite sent successfully!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending portal invite" });
  }
}
