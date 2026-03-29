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
    //  EMAIL TO YOU
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Subscription",
      html: `
      <div style="background:#000; padding:20px; font-family:Arial;">
        <div style="max-width:500px; margin:auto; background:#111; border-radius:10px; overflow:hidden;">

          <div style="background:#0d6efd; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">New Subscriber</h2>
          </div>

          <div style="padding:20px; color:#fff;">
            <p><strong style="color:#0d6efd;">Email:</strong> ${email}</p>
          </div>

        </div>
      </div>
      `,
    });

    //  AUTO-REPLY TO USER
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Subscription Confirmed",
      html: `
      <div style="background:#000; padding:20px; font-family:Arial;">
        <div style="max-width:500px; margin:auto; background:#111; border-radius:10px; overflow:hidden;">

          <div style="background:#0d6efd; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">Sulaiman Graphics</h2>
          </div>

          <div style="padding:20px; color:#fff;">
            <p>Thank you for subscribing to <strong style="color:#0d6efd;">Sulaiman Graphics</strong>.</p>

            <p>You will now receive updates, promotions, and new design releases.</p>

            <br/>

            <p>Stay creative,<br/>
            <strong>Sulaiman Graphics</strong></p>
          </div>

        </div>
      </div>
      `,
    });

    return res.status(200).json({ message: "Subscribed successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error subscribing" });
  }
}
