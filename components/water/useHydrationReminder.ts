"use client";

import { useEffect, useRef, useState } from "react";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

function browserSupportsNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function useHydrationReminder(lastLoggedAtMs: number | null) {
  const [showReminder, setShowReminder] = useState(false);
  const lastNotificationBucketRef = useRef<string | null>(null);

  useEffect(() => {
    const checkReminder = async () => {
      const now = Date.now();
      const shouldRemind =
        lastLoggedAtMs === null || now - lastLoggedAtMs >= TWO_HOURS_MS;

      setShowReminder(shouldRemind);

      if (!shouldRemind) {
        lastNotificationBucketRef.current = null;
        return;
      }

      if (!browserSupportsNotifications()) {
        return;
      }

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission !== "granted") {
        return;
      }

      const bucket =
        lastLoggedAtMs === null
          ? "no-log"
          : String(Math.floor((now - lastLoggedAtMs) / TWO_HOURS_MS));

      if (lastNotificationBucketRef.current === bucket) {
        return;
      }

      new Notification("Time to drink water 💧");
      lastNotificationBucketRef.current = bucket;
    };

    void checkReminder();
    const intervalId = window.setInterval(() => {
      void checkReminder();
    }, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lastLoggedAtMs]);

  return { showReminder };
}
