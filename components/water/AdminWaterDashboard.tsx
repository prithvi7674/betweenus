"use client";

import { AdminCyclePanel } from "@/components/cycle/AdminCyclePanel";
import { FormEvent, useState, useTransition } from "react";
import { AdminGreetingComposer } from "@/components/greetings/AdminGreetingComposer";
import { AdminMessageComposer } from "@/components/messages/AdminMessageComposer";
import { AdminMoodPanel } from "@/components/mood/AdminMoodPanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { HistoryList } from "@/components/water/HistoryList";
import { resetDay, upsertWaterSettings } from "@/firebase/firestore";
import { useWaterTracker } from "@/components/water/useWaterTracker";

export function AdminWaterDashboard() {
  const { profile } = useAuth();
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { totalToday, dailyGoal, progress, loading, history, weeklyAverage, lowIntakeDays } =
    useWaterTracker(profile?.email);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsedGoal = Number(goal);

    if (!profile?.email) {
      setError("No user email found for this account.");
      return;
    }

    if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) {
      setError("Enter a valid daily goal in milliliters.");
      return;
    }

    startTransition(async () => {
      try {
        await upsertWaterSettings({
          userEmail: profile.email,
          dailyGoal: parsedGoal,
        });
        setGoal("");
        setSuccess("Daily goal updated.");
      } catch {
        setError("Unable to update the daily goal right now.");
      }
    });
  };

  const handleResetToday = async () => {
    setError("");
    setSuccess("");

    const confirmed = window.confirm(
      "Are you sure you want to reset today's data?",
    );

    if (!confirmed) {
      return;
    }

    setIsResetting(true);

    try {
      await resetDay();
      setSuccess("Today's data has been reset");
    } catch {
      setError("Unable to reset today's data right now.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section className="dashboard-grid">
      <div className="card stat-card">
        <p className="eyebrow">User Intake Today</p>
        <h2>{loading ? "Loading..." : `${totalToday} ml`}</h2>
        <p className="muted">Today&apos;s total water logged for {profile?.email ?? "this user"}.</p>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Daily Goal</p>
        <h2>{dailyGoal} ml</h2>
        <div className="progress-track" aria-label="Water goal progress">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="muted">{Math.round(progress)}% of today&apos;s target reached.</p>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Weekly Average</p>
        <h2>{weeklyAverage} ml</h2>
        <p className="muted">
          {lowIntakeDays.length} low intake day{lowIntakeDays.length === 1 ? "" : "s"} this week.
        </p>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Goal Settings</p>
          <h2>Update daily goal</h2>
          <p className="muted">Set the target water intake in milliliters.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="daily-goal">Daily goal (ml)</label>
            <input
              id="daily-goal"
              type="number"
              min="1"
              step="1"
              placeholder={String(dailyGoal)}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              required
            />
          </div>

          {error ? <div className="status-box error">{error}</div> : null}
          {success ? <div className="status-box info">{success}</div> : null}

          <button className="primary-button" type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Save goal"}
          </button>
          <button
            className="warning-button"
            type="button"
            onClick={handleResetToday}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset Today"}
          </button>
        </form>
      </div>

      <AdminMessageComposer />
      <AdminGreetingComposer />
      <AdminMoodPanel />
      <AdminCyclePanel />

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Weekly History</p>
          <h2>Low intake highlights</h2>
          <p className="muted">Days below the current goal are highlighted for quick review.</p>
        </div>
        <HistoryList history={history} dailyGoal={dailyGoal} highlightLowDays />
      </div>
    </section>
  );
}
