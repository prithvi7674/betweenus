"use client";

import { useCycleTracker } from "@/components/cycle/useCycleTracker";
import { useMoodTracker } from "@/components/mood/useMoodTracker";
import { NotificationStack } from "@/components/notifications/NotificationStack";
import { useGentleNotifications } from "@/components/notifications/useGentleNotifications";
import { useThinkingOfYou } from "@/components/notifications/useThinkingOfYou";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWaterTracker } from "@/components/water/useWaterTracker";

export function UserNotificationCenter() {
  const { profile } = useAuth();
  const { lastLoggedAtMs } = useWaterTracker(profile?.email);
  const { todayLog } = useMoodTracker(profile?.email);
  const { currentPhase } = useCycleTracker(profile?.email);
  const { latestIncomingEvent } = useThinkingOfYou(profile?.email);
  const { notifications } = useGentleNotifications({
    lastLoggedAtMs,
    currentMood: todayLog?.mood ?? null,
    currentPhase,
    showThinkingOfYou: Boolean(latestIncomingEvent),
  });

  return <NotificationStack notifications={notifications} />;
}
