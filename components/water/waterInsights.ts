import { getPastDateString, getTodayDateString, type WaterLog } from "@/firebase/firestore";

export interface DailyHistoryItem {
  date: string;
  total: number;
  isToday: boolean;
}

export function getMotivationalMessage(progress: number) {
  if (progress >= 100) {
    return "Goal reached. Nice work staying hydrated today.";
  }

  if (progress >= 75) {
    return "You are almost there. One more glass could do it.";
  }

  if (progress >= 40) {
    return "Solid progress. Keep the momentum going.";
  }

  if (progress > 0) {
    return "Good start. Keep sipping through the day.";
  }

  return "Your first glass sets the tone for the day.";
}

export function buildDailyHistory(logs: WaterLog[], days = 7): DailyHistoryItem[] {
  const totalsByDate = new Map<string, number>();

  for (const log of logs) {
    totalsByDate.set(log.date, (totalsByDate.get(log.date) ?? 0) + log.amount);
  }

  const today = getTodayDateString();

  return Array.from({ length: days }, (_, index) => {
    const date = getPastDateString(days - index - 1);

    return {
      date,
      total: totalsByDate.get(date) ?? 0,
      isToday: date === today,
    };
  });
}

export function getWeeklyAverage(history: DailyHistoryItem[]) {
  if (history.length === 0) {
    return 0;
  }

  const total = history.reduce((sum, day) => sum + day.total, 0);
  return Math.round(total / history.length);
}
