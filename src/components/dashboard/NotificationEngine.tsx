// src/components/dashboard/NotificationEngine.tsx
import React, { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface NotificationEngineProps {
  userId: string | undefined;
  userEmail: string | undefined;
}

export function NotificationEngine({ userId, userEmail }: NotificationEngineProps) {
  useEffect(() => {
    if (!userId || !userEmail) return;

    async function initializePushNotifications() {
      // 1. Check if the current user's browser environment supports service workers and native web push APIs
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("Push notifications are not supported by this browser client device environment.");
        return;
      }

      try {
        // 2. Register the hidden background script file
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/"
        });
        
        // 3. Prompt or evaluate permission boundaries (fires the browser prompt for allowed popups)
        let permission = Notification.permission;
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
          console.log("Client denied background push permissions.");
          return;
        }

        // 4. Secure subscription key allocation wrapper configuration
        // Replace publicVapidKey with your real VAPID public key string when deploying push service routes
        const publicVapidKey = "YOUR_VAPID_PUBLIC_KEY_HERE"; 
        
        // Check if an active endpoint registration already exists on this device layout
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription && publicVapidKey !== "YOUR_VAPID_PUBLIC_KEY_HERE") {
          // Register a fresh sync subscription payload endpoint matrix
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // 5. Securely save or update the user's browser device push subscription channel token inside Supabase
        if (subscription) {
          await supabase.from("profiles").update({
            push_subscription_token: subscription.toJSON(),
            device_registered_at: new Date().toISOString()
          }).eq("id", userId);
        }

      } catch (err) {
        console.error("Failed to safely establish web push sync parameters for user identity token:", err);
      }
    }

    initializePushNotifications();
  }, [userId, userEmail]);

  // Base64 helper array decoder mechanism utility mapping logic
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return null; // Silent structural background engine tracker wrapper
}
