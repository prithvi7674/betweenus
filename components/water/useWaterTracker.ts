"use client";

import { useEffect, useState } from "react";
import {
  getTodayDateString,
  subscribeToRecentWaterLogs,
  subscribeToWaterSettings,
  type WaterLog,
  type WaterSettings,
} from "@/firebase/firestore";
import {
  buildDailyHistory,
  getMotivationalMessage,
  getWeeklyAverage,
} from "@/components/water/waterInsights";

export function useWaterTracker(userEmail: string | null | undefined) {
  const [logsState, setLogsState] = useState<{
    email: string | null;
    logs: WaterLog[];
  }>({
    email: null,
    logs: [],
  });
  const [settingsState, setSettingsState] = useState<{
    email: string | null;
    settings: WaterSettings | null;
  }>({
    email: null,
    settings: null,
  });

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const unsubscribeLogs = subscribeToRecentWaterLogs(userEmail, 7, (nextLogs) => {
      setLogsState({
        email: userEmail,
        logs: nextLogs,
      });
    });

    const unsubscribeSettings = subscribeToWaterSettings(userEmail, (nextSettings) => {
      setSettingsState({
        email: userEmail,
        settings: nextSettings,
      });
    });

    return () => {
      unsubscribeLogs();
      unsubscribeSettings();
    };
  }, [userEmail]);

  const logs = userEmail && logsState.email === userEmail ? logsState.logs : [];
  const settings =
    userEmail && settingsState.email === userEmail ? settingsState.settings : null;
  const loading = Boolean(
    userEmail &&
      (logsState.email !== userEmail || settingsState.email !== userEmail),
  );

  const today = getTodayDateString();
  const todayLogs = logs.filter((log) => log.date === today);
  const totalToday = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const dailyGoal = settings?.dailyGoal ?? 2000;
  const progress = dailyGoal > 0 ? Math.min((totalToday / dailyGoal) * 100, 100) : 0;
  const lastLoggedAtMs =
    todayLogs.length > 0
      ? todayLogs.reduce(
          (latest, log) =>
            log.createdAtMs !== null && log.createdAtMs > latest
              ? log.createdAtMs
              : latest,
          0,
        ) || null
      : null;
  const history = buildDailyHistory(logs, 7);
  const weeklyAverage = getWeeklyAverage(history);
  const lowIntakeDays = history.filter((day) => day.total < dailyGoal);
  const motivationalMessage = getMotivationalMessage(progress);

  return {
    logs,
    todayLogs,
    settings,
    loading,
    totalToday,
    dailyGoal,
    progress,
    lastLoggedAtMs,
    history,
    weeklyAverage,
    lowIntakeDays,
    motivationalMessage,
  };
}
