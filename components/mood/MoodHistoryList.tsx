import { moodOptions, type MoodHistoryItem } from "@/components/mood/moodInsights";

interface MoodHistoryListProps {
  history: MoodHistoryItem[];
}

function formatDayLabel(date: string, isToday: boolean) {
  if (isToday) {
    return "Today";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getMoodDisplay(mood: MoodHistoryItem["mood"]) {
  return moodOptions.find((option) => option.mood === mood) ?? null;
}

export function MoodHistoryList({ history }: MoodHistoryListProps) {
  return (
    <div className="history-list">
      {history.map((entry) => {
        const moodDisplay = getMoodDisplay(entry.mood);

        return (
          <div
            key={entry.date}
            className={`history-row${entry.isToday ? " is-today" : ""}`}
          >
            <div>
              <p className="history-label">{formatDayLabel(entry.date, entry.isToday)}</p>
              <p className="history-subtle">{entry.note || entry.date}</p>
            </div>
            <div className="history-value-wrap">
              {moodDisplay ? (
                <strong className="history-value mood-value">
                  <span>{moodDisplay.emoji}</span>
                  <span>{moodDisplay.label}</span>
                </strong>
              ) : (
                <span className="history-subtle">No entry</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
