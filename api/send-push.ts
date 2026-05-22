// api/send-push.ts
// Secure Serverless Web Push Notification Route for Vercel
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1. Synchronized Environment Keys (Reading your new VITE_ prefixes)
const VAPID_PUBLIC_KEY = 
  process.env.VITE_VAPID_PUBLIC_KEY || 
  process.env.VAPID_PUBLIC_KEY || 
  "BNqLSL8l78QTaYEGi5CtCDHJzU4y3f8VlCYmsCWIVG3Izap6ZcD7RHYKMoaNr5nBiZrJ-iDxcTzcumRPDYEkeHU";

const VAPID_PRIVATE_KEY = 
  process.env.VITE_VAPID_PRIVATE_KEY || 
  process.env.VAPID_PRIVATE_KEY;

// Initialize Web Push details securely if private key is present
if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:profsulaiman001@gmail.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// 2. Initialize Authorized Supabase client 
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
// Using service role key allows your backend to lookup profiles flawlessly
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS layout handshakes
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
    const { type, record } = req.body;

    if (!type || !record) {
      return res.status(400).json({ error: "Missing webhook record parameters" });
    }

    if (!VAPID_PRIVATE_KEY) {
      console.error("VAPID_PRIVATE_KEY is missing from environment variables.");
      return res.status(500).json({ error: "Server authentication setup incomplete: Missing private VAPID key" });
    }

    let targetUserId = null;
    let notificationTitle = "Sulaiman Graphics";
    let notificationBody = "You have a new project update.";
    let targetUrl = "/dashboard";

    // 3. Evaluate table insert data matching the chat channels
    if (type === "INSERT" && record.chat_id) {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("user_id, business_name")
        .eq("id", record.chat_id)
        .single();

      if (project) {
        if (record.is_admin) {
          // If admin sent it, notify the customer client
          targetUserId = project.user_id; 
        } else {
          // If a client sent it, locate your Admin profile via email
          const { data: adminProfile } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("email", "profsulaiman001@gmail.com")
            .single();
          
          if (adminProfile) {
            targetUserId = adminProfile.id;
          }
        }
        
        notificationTitle = record.is_admin ? (project.business_name || "Sulaiman Graphics") : "New Client Message";
        notificationBody = record.message.length > 60 ? `${record.message.substring(0, 57)}...` : record.message;
        targetUrl = `/dashboard/chat?id=${record.chat_id}`;
      }
    }

    // Stop execution safely if no recipient profile can be resolved
    if (!targetUserId) {
      return res.status(200).json({ status: "No target push recipient identified" });
    }

    // 4. Retrieve the destination user's active JSON subscription token
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("push_subscription_token")
      .eq("id", targetUserId)
      .single();

    if (profile && profile.push_subscription_token) {
      // Parse token format regardless of whether DB casts it as string or JSON object natively
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

      // 5. Fire packet out securely via web push protocol specifications
      await webpush.sendNotification(subscription, pushPayload);
      
      return res.status(200).json({ success: true, message: "Push notification transmitted successfully" });
    }

    return res.status(200).json({ status: "Recipient device token not registered yet" });

  } catch (error: any) {
    console.error("Push dispatcher route crashed:", error);
    return res.status(500).json({ error: error.message });
  }
    }
