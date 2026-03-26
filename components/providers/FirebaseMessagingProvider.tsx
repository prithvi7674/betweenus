"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { setupNotifications } from "@/firebase/messaging";

export function FirebaseMessagingProvider() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user?.email && profile?.role !== "admin") {
      void setupNotifications(user.email);
    }
  }, [profile?.role, user?.email]);

  return null;
}
