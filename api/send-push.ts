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
    // CASE 1: REAL-TIME CHET MESSAGES
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
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #FFD700;">New Workspace Message</h2>
                <p>Hello,</p>
                <p>You have received a new update regarding your project with <strong>Sulaiman Graphics</strong>:</p>
                <blockquote style="background: #f9f9f9; border-left: 4px solid #FFD700; padding: 10px 20px; margin: 20px 0;">
                  "${record.message}"
                </blockquote>
                <p>Please log into your client dashboard portal to reply directly.</p>
                <br />
                <p>Best regards,<br /><strong>Sulaiman Graphics Team</strong></p>
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
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #FFD700;">New Design Feedback Added</h2>
                <p>Hi there,</p>
                <p>An official design comment has been posted onto your asset version tracker:</p>
                <blockquote style="background: #f9f9f9; border-left: 4px solid #FFD700; padding: 10px 20px; margin: 20px 0;">
                  "${record.message}"
                </blockquote>
                <p>Tap your project panel profile to view changes.</p>
                <br />
                <p>Best regards,<br /><strong>Sulaiman Graphics Team</strong></p>
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
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #FFD700; text-align: center;">Design Asset Uploaded 🎉</h2>
              <p>Great news!</p>
              <p>A brand new structural design layout iteration <strong>[${record.version_name || "v1"}]</strong> has been uploaded to your secure graphics folder for <strong>${project.title || "your review"}</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.sulaimangraphics.com.ng/dashboard" style="background-color: #FFD700; color: #000; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Open Client Workspace Dashboard</a>
              </div>
              <p>Click the secure button above to view full high-resolution image renders, leave markup flags, or directly approve the master copy file.</p>
              <br />
              <p>Best regards,<br /><strong>Sulaiman Graphics Studio</strong></p>
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
