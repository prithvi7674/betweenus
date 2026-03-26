"use client";

import { MessageCard } from "@/components/messages/MessageCard";
import { moodOptions } from "@/components/mood/moodInsights";
import { useMoodTracker } from "@/components/mood/useMoodTracker";
import { useMessages } from "@/components/messages/useMessages";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCycleTracker } from "@/components/cycle/useCycleTracker";
import { useWaterTracker } from "@/components/water/useWaterTracker";

export function UserHomeSummary() {
  const { profile } = useAuth();
  const { totalToday, dailyGoal, progress } = useWaterTracker(profile?.email);
  const { todayLog } = useMoodTracker(profile?.email);
  const { currentPhase, currentDay, nextPeriodDate, phaseInfo } =
    useCycleTracker(profile?.email);
  const { latestMessages, newMessageIds, loading } = useMessages();
  const latestMessage = latestMessages[0] ?? null;
  const todayMoodLabel =
    moodOptions.find((option) => option.mood === todayLog?.mood)?.label ?? "No mood logged";

  return (
    <>
      <div className="card stat-card">
        <p className="eyebrow">Water Progress</p>
        <div className="summary-progress-wrap">
          <div
            className="circular-progress"
            style={{ ["--progress" as string]: `${progress}%` }}
          >
            <div className="circular-progress-inner">
              <strong>{Math.round(progress)}%</strong>
            </div>
          </div>
          <div>
            <h2>{totalToday} / {dailyGoal} ml</h2>
            <p className="muted">Hydration progress for today.</p>
          </div>
        </div>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Today&apos;s Mood</p>
        <h2>{todayMoodLabel}</h2>
        <p className="muted">{todayLog?.note || "No note recorded yet."}</p>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Cycle Phase</p>
        <h2>{currentDay ? `Day ${currentDay}` : "No cycle data"}</h2>
        <p className="muted">
          {currentPhase
            ? `${currentPhase}${nextPeriodDate ? ` • ${nextPeriodDate}` : ""}`
            : phaseInfo}
        </p>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Latest Message</p>
          <h2>One note for right now</h2>
          <p className="muted">The newest message in your shared space.</p>
        </div>
        {loading ? (
          <p className="muted">Loading messages...</p>
        ) : latestMessage ? (
          <MessageCard
            message={latestMessage}
            unlocked={progress >= 100}
            highlight
            isNew={newMessageIds.has(latestMessage.id)}
          />
        ) : (
          <p className="muted">No messages yet.</p>
        )}
      </div>
    </>
  );
}
