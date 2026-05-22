// api/send-push.ts
// Dual-Engine Notification Gateway for Sulaiman Graphics
// Admin alerts via Telegram | Client alerts via Email
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// Emergency Inline Module Bypass for Vercel Type Analyzer
declare module '@supabase/supabase-js';
declare module 'nodemailer';

export default async function handler(req: any, res: any) {
  // Cross-Origin Resource Sharing Handshake Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Initialize authorized Database Client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Read Notification Gateways Keys
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const emailUser = process.env.EMAIL_USER || "profsulaiman001@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    // Parse the data packet incoming from Supabase Webhook Triggers
    const { record, table, type } = req.body;
    if (!type || !record) return res.status(400).json({ error: "Missing webhook record payload" });

    // ==========================================
    // CASE 1: REAL-TIME CHAT MESSAGES
    // ==========================================
    if (table === "chat_messages" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("business_name, client_email")
        .eq("id", record.chat_id || record.project_id)
        .single();

      if (!record.is_admin) {
        // A. CLIENT SENT A MESSAGE -> Alert Sulaiman's phone immediately via Telegram
        if (botToken && chatId) {
          const studioName = project?.business_name || "New Client";
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `💬 *New Client Message*\n\n*Studio:* ${studioName}\n*Message:* ${record.message}`,
              parse_mode: "Markdown"
            })
          });
          return res.status(200).json({ success: true, target: "Admin Telegram" });
        }
      } else {
        // B. ADMIN (YOU) SENT A MESSAGE -> Send a professional email alert to the Client's inbox
        if (project && project.client_email && emailPass) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: emailUser, pass: emailPass }
          });

          await transporter.sendMail({
            from: `"Sulaiman Graphics" <${emailUser}>`,
            to: project.client_email,
            subject: `New message in your design workspace! 💬`,
            html: `
              <div style="font-family: sans-serif; padding: 30px; background-color: #000000; color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px;">
                <h2 style="color: #0070f3; margin-top: 0; font-size: 24px; border-bottom: 1px solid #222222; padding-bottom: 15px;">New Workspace Message</h2>
                <p style="color: #ffffff; font-size: 16px;">Hello,</p>
                <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">You have received a new live chat update regarding your running project setup with <strong>Sulaiman Graphics</strong>:</p>
                <blockquote style="background: #111111; border-left: 4px solid #0070f3; padding: 15px 20px; margin: 25px 0; color: #ffffff; font-style: italic; border-radius: 0 4px 4px 0;">
                  "${record.message}"
                </blockquote>
                <p style="color: #cccccc; font-size: 14px;">Please log into your official studio customer dashboard portal workspace to reply directly.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.sulaimangraphics.com.ng/dashboard" style="background-color: #0070f3; color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">Reply inside Dashboard</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #222222; margin-top: 30px;" />
                <p style="color: #888888; font-size: 13px; margin-bottom: 0;">Best regards,<br /><strong style="color: #ffffff;">Sulaiman Graphics Team</strong></p>
              </div>
            `
          });
          return res.status(200).json({ success: true, target: "Client Email Notification" });
        }
      }
    }

    // ==========================================
    // CASE 2: PROJECT COLLABORATION COMMENTS
    // ==========================================
    if (table === "comments" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("business_name, client_email")
        .eq("id", record.project_id)
        .single();

      if (!record.is_admin) {
        // A. CLIENT COMMENTED -> Push alert straight to Sulaiman's Telegram
        if (botToken && chatId) {
          const studioName = project?.business_name || "Client Workspace";
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `📝 *New Project Feedback*\n\n*From:* ${studioName}\n*Comment:* ${record.message}`,
              parse_mode: "Markdown"
            })
          });
          return res.status(200).json({ success: true, target: "Admin Telegram" });
        }
      } else {
        // B. ADMIN COMMENTED -> Dispatch update email to Client's inbox
        if (project && project.client_email && emailPass) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: emailUser, pass: emailPass }
          });

          await transporter.sendMail({
            from: `"Sulaiman Graphics" <${emailUser}>`,
            to: project.client_email,
            subject: `New structural feedback on your design draft! 📝`,
            html: `
              <div style="font-family: sans-serif; padding: 30px; background-color: #000000; color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px;">
                <h2 style="color: #0070f3; margin-top: 0; font-size: 24px; border-bottom: 1px solid #222222; padding-bottom: 15px;">Design Feedback Added</h2>
                <p style="color: #ffffff; font-size: 16px;">Hi there,</p>
                <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">An official design update annotation has been added onto your asset version tracker asset timeline:</p>
                <blockquote style="background: #111111; border-left: 4px solid #0070f3; padding: 15px 20px; margin: 25px 0; color: #ffffff; font-style: italic; border-radius: 0 4px 4px 0;">
                  "${record.message}"
                </blockquote>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.sulaimangraphics.com.ng/dashboard" style="background-color: #0070f3; color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">View Layout Review</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #222222; margin-top: 30px;" />
                <p style="color: #888888; font-size: 13px; margin-bottom: 0;">Best regards,<br /><strong style="color: #ffffff;">Sulaiman Graphics Team</strong></p>
              </div>
            `
          });
          return res.status(200).json({ success: true, target: "Client Email Notification" });
        }
      }
    }

    // ==========================================
    // CASE 3: GRAPHIC ASSET VERSION UPLOADS
    // ==========================================
    if (table === "project_versions" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title, client_email")
        .eq("id", record.project_id)
        .single();

      // Design assets are strictly uploaded by you, so this always notifies the client
      if (project && project.client_email && emailPass) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass }
        });

        await transporter.sendMail({
          from: `"Sulaiman Graphics" <${emailUser}>`,
          to: project.client_email,
          subject: `Your New Design is Ready! 🎉 - ${project.title || "Studio Update"}`,
          html: `
            <div style="font-family: sans-serif; padding: 30px; background-color: #000000; color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px;">
              <h2 style="color: #0070f3; text-align: center; margin-top: 0; font-size: 26px; font-weight: bold;">Design Asset Uploaded 🎉</h2>
              <p style="color: #ffffff; font-size: 16px;">Great news!</p>
              <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">A brand new structural design layout iteration <strong style="color: #ffffff;">[${record.version_name || "v1"}]</strong> has been successfully uploaded to your secure graphics dashboard folder for <strong style="color: #ffffff;">${project.title || "your review"}</strong>.</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="https://www.sulaimangraphics.com.ng/dashboard" style="background-color: #0070f3; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 16px; box-shadow: 0 4px 14px rgba(0, 112, 243, 0.4);">Open Client Workspace Dashboard</a>
              </div>
              
              <p style="color: #aaaaaa; font-size: 14px; line-height: 1.5; text-align: center;">Click the secure workspace link button above to instantly view full high-resolution image renders, leave markup feedback pins, or directly download approved copy files.</p>
              <hr style="border: 0; border-top: 1px solid #222222; margin-top: 30px;" />
              <p style="color: #888888; font-size: 13px; margin-bottom: 0;">Best regards,<br /><strong style="color: #ffffff;">Sulaiman Graphics Studio</strong></p>
            </div>
          `
        });
        return res.status(200).json({ success: true, target: "Client Version Upload Email" });
      }
    }

    return res.status(200).json({ status: "No notification trigger targets were hit safely" });

  } catch (error: any) {
    console.error("Central notification router crash:", error);
    return res.status(500).json({ error: error.message });
  }
}
