import { type DailyHistoryItem } from "@/components/water/waterInsights";

interface HistoryListProps {
  history: DailyHistoryItem[];
  dailyGoal: number;
  highlightLowDays?: boolean;
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

export function HistoryList({
  history,
  dailyGoal,
  highlightLowDays = false,
}: HistoryListProps) {
  return (
    <div className="history-list">
      {history.map((day) => {
        const isLow = highlightLowDays && day.total < dailyGoal;

        return (
          <div
            key={day.date}
            className={`history-row${day.isToday ? " is-today" : ""}${isLow ? " is-low" : ""}`}
          >
            <div>
              <p className="history-label">{formatDayLabel(day.date, day.isToday)}</p>
              <p className="history-subtle">{day.date}</p>
            </div>
            <div className="history-value-wrap">
              <strong className="history-value">{day.total} ml</strong>
              {isLow ? <span className="history-chip">Low intake</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
