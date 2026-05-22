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
      // 1. Diagnostic Step: Check if user data is successfully passed as props
      if (!userId || !userEmail) {
        window.alert(`Notification Engine Stopped: Missing authentication credentials (userId: ${userId || 'undefined'})`);
        return;
      }

      // 2. Diagnostic Step: Check browser environment APIs
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        window.alert("Notification Engine Stopped: This browser device environment does not support native web push APIs.");
        return;
      }

      try {
        // 3. Diagnostic Step: Check current permission boundaries
        window.alert(`Current Device Permission Status: ${Notification.permission}`);

        // Register the background service worker script file mapping root paths
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/"
        });
        
        // 4. Handle Permission Request Trigger Logic Flow
        let permission = Notification.permission;
        if (permission === "default") {
          window.alert("Triggering native browser permission prompt block now...");
          permission = await Notification.requestPermission();
          window.alert(`User selection choice: ${permission}`);
        }

        if (permission !== "granted") {
          window.alert("Notification Engine Stopped: Client explicitly denied background push permissions.");
          return;
        }

        // Hardcoded secure public application server VAPID tracking key
        const publicVapidKey = "BNqLSL8l78QTaYEGi5CtCDHJzU4y3f8VlCYmsCWIVG3Izap6ZcD7RHYKMoaNr5nBiZrJ-iDxcTzcumRPDYEkeHU";

        // Check if an active endpoint registration already exists on this device layout
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          window.alert("No active subscription channel found. Generating fresh push token endpoint...");
          // Register a fresh sync subscription payload endpoint matrix
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // 5. Securely save or update the user's browser device push subscription channel token inside Supabase
        if (subscription) {
          window.alert("Push token generated successfully. Syncing subscription device target with Supabase tables...");
          const { error } = await supabase
            .from("profiles")
            .update({
              push_subscription_token: subscription.toJSON(),
              device_registered_at: new Date().toISOString()
            })
            .eq("id", userId);

          if (error) {
            window.alert(`Supabase sync failed: ${error.message}`);
          } else {
            window.alert("Device subscription channel successfully registered! Ready to receive background push streams.");
          }
        }

      } catch (err: any) {
        window.alert(`Notification prompt crashed with execution error: ${err?.message || err}`);
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
