import { Resend } from 'resend';

// This pulls the key safely from your environment variables instead of hardcoding it.
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { clientEmail, projectTitle, fileUrl } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Sulaiman Graphics <hello@sulaimangraphics.com.ng>',
      to: [clientEmail],
      subject: `Your design asset for "${projectTitle}" is ready!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="color: #2563eb;">Sulaiman Graphics</h2>
          <p>Hello,</p>
          <p>I have uploaded a new design for your project: <strong>${projectTitle}</strong>.</p>
          <p>You can view and approve the design directly by logging into your portal dashboard.</p>
          <div style="margin: 25px 0;">
            <a href="https://sulaimangraphics.com.ng" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
          </div>
          <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: https://sulaimangraphics.com.ng</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
