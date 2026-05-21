// api/send-push.ts
// Secure Serverless Web Push Notification Route for Vercel
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1. Configure your cryptographic VAPID keys for secure push handshakes
// These authenticate sulaimangraphics.com.ng to browser vendor servers
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "YOUR_VAPID_PUBLIC_KEY_HERE";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "YOUR_VAPID_PRIVATE_KEY_HERE";

webpush.setVapidDetails(
  "mailto:profsulaiman001@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS cross-origin layout requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Initialize the Supabase Admin client with your system environment keys
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Extract the raw change tracking record from the Supabase Database Webhook payload
    const { record, table, type } = req.body;

    let targetUserId = "";
    let notificationTitle = "Sulaiman Graphics";
    let notificationBody = "Your design workspace matrix has been updated.";
    let targetUrl = "/dashboard";

    // CASE A: You committed a brand new draft or final design asset version array
    if (table === "project_versions" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title, client_email")
        .eq("id", record.project_id)
        .single();

      if (project && project.client_email) {
        const { data: clientProfile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", project.client_email)
          .single();

        if (clientProfile) {
          targetUserId = clientProfile.id;
          notificationTitle = "New Design Uploaded! 🔥";
          notificationBody = `[${project.title}] - ${record.version_name || "A new draft design file is ready for review."}`;
          targetUrl = "/dashboard";
        }
      }
    }

    // CASE B: A comment message was dropped into Chat Studio or project feeds
    if (table === "comments" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title, client_email, user_id")
        .eq("id", record.project_id)
        .single();

      if (project) {
        if (record.is_admin) {
          // Message sent by you -> Send alert to client's phone screen
          const { data: clientProfile } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("email", project.client_email)
            .single();
          if (clientProfile) targetUserId = clientProfile.id;
        } else {
          // Message sent by client -> Send alert directly to your phone screen
          targetUserId = project.user_id; 
        }
        
        notificationTitle = record.is_admin ? "Sulaiman Graphics" : "Client Feedback Alert";
        notificationBody = record.message.length > 60 ? `${record.message.substring(0, 57)}...` : record.message;
        targetUrl = "/dashboard";
      }
    }

    // Stop execution safely if no recipient profile can be resolved
    if (!targetUserId) {
      return res.status(200).json({ status: "No target push recipient identified" });
    }

    // 3. Look up the destination user's active background push registration token
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("push_subscription_token")
      .eq("id", targetUserId)
      .single();

    if (profile && profile.push_subscription_token) {
      const pushPayload = JSON.stringify({
        title: notificationTitle,
        body: notificationBody,
        url: targetUrl,
        icon: "/favicon.ico",
        badge: "/favicon.ico"
      });

      // 4. Beam the notification payload out securely via Web Push API rules
      await webpush.sendNotification(profile.push_subscription_token, pushPayload);
      
      return res.status(200).json({ success: true, message: "Push notification transmitted successfully" });
    }

    return res.status(200).json({ status: "Recipient device token not registered yet" });

  } catch (error: any) {
    console.error("Push dispatcher error:", error);
    return res.status(400).json({ error: error.message });
  }
}
