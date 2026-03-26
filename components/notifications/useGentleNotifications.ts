"use client";

import { useEffect, useState } from "react";
import { type CyclePhase } from "@/components/cycle/cycleInsights";
import { type MoodType } from "@/firebase/firestore";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

export interface GentleNotification {
  id: string;
  title: string;
  body: string;
}

interface NotificationInput {
  lastLoggedAtMs: number | null;
  currentMood: MoodType | null;
  currentPhase: CyclePhase | null;
  showThinkingOfYou: boolean;
}

export function useGentleNotifications({
  lastLoggedAtMs,
  currentMood,
  currentPhase,
  showThinkingOfYou,
}: NotificationInput) {
  const [notifications, setNotifications] = useState<GentleNotification[]>([]);

  useEffect(() => {
    const checkNotifications = () => {
      const now = Date.now();
      const nextNotifications: GentleNotification[] = [];

      if (lastLoggedAtMs === null || now - lastLoggedAtMs >= TWO_HOURS_MS) {
        nextNotifications.push({
          id: "water",
          title: "Hydration Reminder",
          body: "Time to drink water 💧",
        });
      }

      if (currentMood === "sad") {
        nextNotifications.push({
          id: "mood",
          title: "A Gentle Note",
          body: "You deserve softness today. Take things one kind step at a time.",
        });
      }

      if (currentPhase === "Menstrual Phase") {
        nextNotifications.push({
          id: "cycle",
          title: "Care Reminder",
          body: "This is a good time for extra rest, warmth, and gentle care.",
        });
      }

      if (showThinkingOfYou) {
        nextNotifications.push({
          id: "thinking",
          title: "Thinking of You",
          body: "Someone is thinking of you ❤️",
        });
      }

      setNotifications(nextNotifications);
    };

    checkNotifications();
    const intervalId = window.setInterval(checkNotifications, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentMood, currentPhase, lastLoggedAtMs, showThinkingOfYou]);

  return { notifications };
}
