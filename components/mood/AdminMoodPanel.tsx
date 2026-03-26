"use client";

import { MoodHistoryList } from "@/components/mood/MoodHistoryList";
import { moodOptions } from "@/components/mood/moodInsights";
import { useMoodTracker } from "@/components/mood/useMoodTracker";
import { useAuth } from "@/components/providers/AuthProvider";

export function AdminMoodPanel() {
  const { profile } = useAuth();
  const { todayLog, history, trendCounts, loading } = useMoodTracker(profile?.email);

  return (
    <>
      <div className="card stat-card">
        <p className="eyebrow">Latest Mood</p>
        <h2>
          {loading
            ? "Loading..."
            : todayLog
              ? moodOptions.find((option) => option.mood === todayLog.mood)?.label
              : "No mood logged today"}
        </h2>
        <p className="muted">
          {todayLog?.note || "No note added for the latest mood entry."}
        </p>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Mood Trends</p>
          <h2>7-day overview</h2>
          <p className="muted">A soft snapshot of how the week has been feeling.</p>
        </div>

        <div className="trend-grid">
          {moodOptions.map((option) => (
            <div key={option.mood} className="trend-card">
              <span className="mood-emoji">{option.emoji}</span>
              <strong>{trendCounts[option.mood]}</strong>
              <span className="history-subtle">{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Mood Logs</p>
          <h2>Recent check-ins</h2>
          <p className="muted">Review the latest 7 days of recorded moods and notes.</p>
        </div>
        <MoodHistoryList history={history} />
      </div>
    </>
  );
}
