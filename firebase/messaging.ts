"use client";

import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { firebaseApp } from "@/firebase/config";

export async function setupNotifications(userEmail: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  const messaging = getMessaging(firebaseApp);
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    console.warn("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY for FCM.");
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (token) {
    await fetch("/api/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, userEmail }),
    });
  }

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "New Message 💌";
    const body = payload.notification?.body ?? "You have a new update.";

    new Notification(title, {
      body,
    });
  });

  return token ?? null;
}
