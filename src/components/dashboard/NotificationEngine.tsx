// src/components/dashboard/NotificationEngine.tsx
import React, { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface NotificationEngineProps {
  userId: string | undefined;
  userEmail: string | undefined;
}

export function NotificationEngine({ userId, userEmail }: NotificationEngineProps) {
  useEffect(() => {
    async function initializePushNotifications() {
      // 1. Session boundary check
      if (!userId || !userEmail) {
        return;
      }

      // 2. Client environment feature verification
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("Push notifications are not supported by this browser environment.");
        return;
      }

      try {
        // Register the background service worker architecture script tracking the root domain scope
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/"
        });
        
        // 3. Evaluate browser permissions
        let permission = Notification.permission;
        
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
          console.log("Client denied background push permissions.");
          return;
        }

        // Hardcoded secure public application server VAPID matrix key
        const publicVapidKey = "BNqLSL8l78QTaYEGi5CtCDHJzU4y3f8VlCYmsCWIVG3Izap6ZcD7RHYKMoaNr5nBiZrJ-iDxcTzcumRPDYEkeHU";

        // Check if an active endpoint registration already exists on this device layout
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Register a fresh sync subscription payload endpoint channel matrix
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // 4. Securely save or update the user's browser device push subscription channel token inside Supabase
        if (subscription) {
          await supabase
            .from("profiles")
            .update({
              push_subscription_token: subscription.toJSON(),
              device_registered_at: new Date().toISOString()
            })
            .eq("id", userId);
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
