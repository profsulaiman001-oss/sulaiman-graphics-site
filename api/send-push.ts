// api/send-push.ts
// Secure Serverless Web Push Notification Route for Vercel
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1. Configure cryptographic VAPID keys reading directly from your new VITE_ environment variables
const VAPID_PUBLIC_KEY = 
  process.env.VITE_VAPID_PUBLIC_KEY || 
  process.env.VAPID_PUBLIC_KEY || 
  "BNqLSL8l78QTaYEGi5CtCDHJzU4y3f8VlCYmsCWIVG3Izap6ZcD7RHYKMoaNr5nBiZrJ-iDxcTzcumRPDYEkeHU";

const VAPID_PRIVATE_KEY = 
  process.env.VITE_VAPID_PRIVATE_KEY || 
  process.env.VAPID_PRIVATE_KEY;

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:profsulaiman001@gmail.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS cross-origin handshakes
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
    // 2. Initialize authorized Supabase Client using synchronized environment prefix keys
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Extract the webhook payload data from Supabase table monitoring
    const { record, table, type } = req.body;

    if (!type || !record) {
      return res.status(400).json({ error: "Missing webhook record parameters" });
    }

    let targetUserId = "";
    let notificationTitle = "Sulaiman Graphics";
    let notificationBody = "You have a new workspace update.";
    let targetUrl = "/dashboard";

    // ACTION 1: Direct Chat Messages (The live Chat Page)
    if (table === "chat_messages" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("user_id, business_name")
        .eq("id", record.chat_id || record.project_id)
        .single();

      if (project) {
        if (record.is_admin) {
          // Admin sent a message -> Route straight to Client's system phone tray
          targetUserId = project.user_id;
          notificationTitle = "Sulaiman Graphics (Admin)";
          notificationBody = record.message;
        } else {
          // Client sent a message -> Route straight to your Admin phone tray
          const { data: adminProfile } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("email", "profsulaiman001@gmail.com")
            .single();
          
          if (adminProfile) targetUserId = adminProfile.id;
          notificationTitle = project.business_name || "New Client Message";
          notificationBody = record.message;
        }
        targetUrl = `/dashboard/chat?id=${record.chat_id || record.project_id}`;
      }
    }

    // ACTION 2: Project Discussion Comments Feed
    if (table === "comments" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title, client_email, user_id, business_name")
        .eq("id", record.project_id)
        .single();

      if (project) {
        if (record.is_admin) {
          // Admin commented -> Notify Client
          const { data: clientProfile } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("email", project.client_email)
            .single();
          if (clientProfile) targetUserId = clientProfile.id;
          notificationTitle = "New Admin Comment";
        } else {
          // Client commented -> Notify Admin
          const { data: adminProfile } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("email", "profsulaiman001@gmail.com")
            .single();
          if (adminProfile) targetUserId = adminProfile.id;
          notificationTitle = `Feedback: ${project.business_name || "Client"}`;
        }
        notificationBody = record.message;
        targetUrl = `/dashboard/project/${record.project_id}`;
      }
    }

    // ACTION 3: Direct Design Asset / Image Uploads
    if (table === "project_versions" && type === "INSERT") {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title, client_email, business_name")
        .eq("id", record.project_id)
        .single();

      if (project && project.client_email) {
        // Design uploaded by Admin -> Notify Client automatically
        const { data: clientProfile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", project.client_email)
          .single();

        if (clientProfile) {
          targetUserId = clientProfile.id;
          notificationTitle = "Your Design is Ready! 🎉";
          notificationBody = `A new design file [${record.version_name || "v1"}] has been uploaded for ${project.title}. Tap to view!`;
          targetUrl = "/dashboard";
        }
      }
    }

    // Exit safely if no destination user profile was matched
    if (!targetUserId) {
      return res.status(200).json({ status: "No target push recipient identified" });
    }

    // 3. Query the target user's system device push token from profiles
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("push_subscription_token")
      .eq("id", targetUserId)
      .single();

    if (profile && profile.push_subscription_token) {
      // Safely parse JSON structure regardless of database format definitions
      const subscription = typeof profile.push_subscription_token === "string"
        ? JSON.parse(profile.push_subscription_token)
        : profile.push_subscription_token;

      const pushPayload = JSON.stringify({
        title: notificationTitle,
        body: notificationBody,
        url: targetUrl,
        icon: "/favicon.ico",
        badge: "/favicon.ico"
      });

      // 4. Send the push packet straight to Google/Apple/Mozilla system servers
      await webpush.sendNotification(subscription, pushPayload);
      
      return res.status(200).json({ success: true, message: "System push notification transmitted successfully" });
    }

    return res.status(200).json({ status: "Recipient device token not registered in system" });

  } catch (error: any) {
    console.error("Push dispatcher engine error:", error);
    return res.status(500).json({ error: error.message });
  }
}
