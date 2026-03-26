"use client";

import { FormEvent, useState, useTransition } from "react";
import { useCycleTracker } from "@/components/cycle/useCycleTracker";
import { UserCyclePanel } from "@/components/cycle/UserCyclePanel";
import { UserMessagesPanel } from "@/components/messages/UserMessagesPanel";
import { UserMoodPanel } from "@/components/mood/UserMoodPanel";
import { useMoodTracker } from "@/components/mood/useMoodTracker";
import { NotificationStack } from "@/components/notifications/NotificationStack";
import { useGentleNotifications } from "@/components/notifications/useGentleNotifications";
import { useThinkingOfYou } from "@/components/notifications/useThinkingOfYou";
import { useAuth } from "@/components/providers/AuthProvider";
import { addWaterLog, getTodayDateString } from "@/firebase/firestore";
import { HistoryList } from "@/components/water/HistoryList";
import { useWaterTracker } from "@/components/water/useWaterTracker";

export function UserWaterDashboard() {
  const { profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    totalToday,
    dailyGoal,
    progress,
    loading,
    lastLoggedAtMs,
    history,
    motivationalMessage,
  } = useWaterTracker(profile?.email);
  const { todayLog } = useMoodTracker(profile?.email);
  const { currentPhase } = useCycleTracker(profile?.email);
  const { latestIncomingEvent } = useThinkingOfYou(profile?.email);
  const { notifications } = useGentleNotifications({
    lastLoggedAtMs,
    currentMood: todayLog?.mood ?? null,
    currentPhase,
    showThinkingOfYou: Boolean(latestIncomingEvent),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amount);

    if (!profile?.email) {
      setError("No user email found for this account.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid water amount in milliliters.");
      return;
    }

    startTransition(async () => {
      try {
        await addWaterLog({
          userEmail: profile.email,
          amount: parsedAmount,
          date: getTodayDateString(),
        });
        setAmount("");
      } catch {
        setError("Unable to save your water intake right now.");
      }
    });
  };

  return (
    <section className="dashboard-grid">
      <NotificationStack notifications={notifications} />

      <div className="card stat-card">
        <p className="eyebrow">Today&apos;s Intake</p>
        <h2>{loading ? "Loading..." : `${totalToday} ml`}</h2>
        <p className="muted">Keep logging water to stay on top of your hydration goal.</p>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Daily Goal</p>
        <h2>{dailyGoal} ml</h2>
        <div className="progress-track" aria-label="Water goal progress">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="muted">{Math.round(progress)}% of your goal completed today.</p>
        <p className="message-pill">{motivationalMessage}</p>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Log Water</p>
          <h2>Add water intake</h2>
          <p className="muted">Record each glass or bottle in milliliters.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="water-amount">Water amount (ml)</label>
            <input
              id="water-amount"
              type="number"
              min="1"
              step="1"
              placeholder="250"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          {error ? <div className="status-box error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Log intake"}
          </button>
        </form>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Daily History</p>
          <h2>Last 7 days</h2>
          <p className="muted">A quick look at your hydration consistency this week.</p>
        </div>
        <HistoryList history={history} dailyGoal={dailyGoal} />
      </div>

      <UserMessagesPanel goalCompleted={progress >= 100} />
      <UserMoodPanel />
      <UserCyclePanel />
    </section>
  );
}
