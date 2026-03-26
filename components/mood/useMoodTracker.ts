"use client";

import { useEffect, useState } from "react";
import {
  getTodayDateString,
  subscribeToRecentMoodLogs,
  type MoodLog,
} from "@/firebase/firestore";
import {
  buildMoodHistory,
  getMoodResponse,
  getMoodTrendCounts,
} from "@/components/mood/moodInsights";

export function useMoodTracker(userEmail: string | null | undefined) {
  const [logsState, setLogsState] = useState<{
    email: string | null;
    logs: MoodLog[];
  }>({
    email: null,
    logs: [],
  });

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const unsubscribe = subscribeToRecentMoodLogs(userEmail, 7, (nextLogs) => {
      setLogsState({
        email: userEmail,
        logs: nextLogs,
      });
    });

    return unsubscribe;
  }, [userEmail]);

  const logs = userEmail && logsState.email === userEmail ? logsState.logs : [];
  const loading = Boolean(userEmail && logsState.email !== userEmail);
  const today = getTodayDateString();
  const todayLog =
    logs
      .filter((log) => log.date === today)
      .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0))[0] ?? null;
  const history = buildMoodHistory(logs, 7);
  const moodResponse = getMoodResponse(todayLog?.mood ?? null);
  const trendCounts = getMoodTrendCounts(history);

  return {
    logs,
    loading,
    todayLog,
    history,
    moodResponse,
    trendCounts,
  };
}
