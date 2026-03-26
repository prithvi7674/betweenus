import {
  getPastDateString,
  getTodayDateString,
  type MoodLog,
  type MoodType,
} from "@/firebase/firestore";

export interface MoodHistoryItem {
  date: string;
  mood: MoodType | null;
  note: string;
  isToday: boolean;
}

export const moodOptions: Array<{
  mood: MoodType;
  emoji: string;
  label: string;
}> = [
  { mood: "happy", emoji: "😊", label: "Happy" },
  { mood: "okay", emoji: "🙂", label: "Okay" },
  { mood: "sad", emoji: "😔", label: "Sad" },
  { mood: "angry", emoji: "😠", label: "Angry" },
];

export function getMoodResponse(mood: MoodType | null) {
  switch (mood) {
    case "happy":
      return "That energy is beautiful. Let it carry you through the day.";
    case "sad":
      return "It is okay to slow down. Be gentle with yourself today.";
    case "angry":
      return "Take one deep breath at a time. You do not have to hold the whole storm at once.";
    case "okay":
      return "Steady is still progress. Small moments of care matter.";
    default:
      return "Check in with yourself and log how you are feeling today.";
  }
}

export function buildMoodHistory(logs: MoodLog[], days = 7): MoodHistoryItem[] {
  const byDate = new Map<string, MoodLog>();

  for (const log of logs) {
    const current = byDate.get(log.date);
    if (!current || (log.createdAtMs ?? 0) > (current.createdAtMs ?? 0)) {
      byDate.set(log.date, log);
    }
  }

  const today = getTodayDateString();

  return Array.from({ length: days }, (_, index) => {
    const date = getPastDateString(days - index - 1);
    const entry = byDate.get(date);

    return {
      date,
      mood: entry?.mood ?? null,
      note: entry?.note ?? "",
      isToday: date === today,
    };
  });
}

export function getMoodTrendCounts(history: MoodHistoryItem[]) {
  return history.reduce<Record<MoodType, number>>(
    (acc, day) => {
      if (day.mood) {
        acc[day.mood] += 1;
      }

      return acc;
    },
    {
      happy: 0,
      okay: 0,
      sad: 0,
      angry: 0,
    },
  );
}
