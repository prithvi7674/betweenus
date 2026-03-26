"use client";

import { FormEvent, useState, useTransition } from "react";
import { CycleCalendar } from "@/components/cycle/CycleCalendar";
import { useCycleTracker } from "@/components/cycle/useCycleTracker";
import { useAuth } from "@/components/providers/AuthProvider";
import { upsertCycleSettings } from "@/firebase/firestore";

export function UserCyclePanel() {
  const { profile, user } = useAuth();
  const {
    settings,
    loading,
    currentPhase,
    currentDay,
    nextPeriodDays,
    nextPeriodDate,
    phaseInfo,
    careSuggestions,
    monthLabel,
    weekDays,
    calendarDays,
  } = useCycleTracker(profile?.email);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const resolvedLastPeriodDate = lastPeriodDate || settings?.lastPeriodDate || "";
  const resolvedCycleLength = cycleLength || (settings ? String(settings.cycleLength) : "");

  if (!user) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profile?.email) {
      setError("No user email found for this account.");
      return;
    }

    const parsedCycleLength = Number(resolvedCycleLength);

    if (!resolvedLastPeriodDate) {
      setError("Choose your last period date.");
      return;
    }

    if (!Number.isFinite(parsedCycleLength) || parsedCycleLength < 20 || parsedCycleLength > 45) {
      setError("Enter a cycle length between 20 and 45 days.");
      return;
    }

    startTransition(async () => {
      try {
        await upsertCycleSettings({
          userEmail: profile.email,
          lastPeriodDate: resolvedLastPeriodDate,
          cycleLength: parsedCycleLength,
        });
        setSuccess("Cycle details saved.");
      } catch {
        setError("Unable to save cycle details right now.");
      }
    });
  };

  return (
    <>
      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Cycle Tracker</p>
          <h2>Track your cycle</h2>
          <p className="muted">Save your last period date and typical cycle length.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="last-period-date">Last period date</label>
            <input
              id="last-period-date"
              type="date"
              value={resolvedLastPeriodDate}
              onChange={(event) => setLastPeriodDate(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cycle-length">Cycle length (days)</label>
            <input
              id="cycle-length"
              type="number"
              min="20"
              max="45"
              value={resolvedCycleLength}
              onChange={(event) => setCycleLength(event.target.value)}
              required
            />
          </div>

          {error ? <div className="status-box error">{error}</div> : null}
          {success ? <div className="status-box info">{success}</div> : null}

          <button className="primary-button" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save cycle"}
          </button>
        </form>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Current Cycle</p>
        <h2>{loading ? "Loading..." : currentDay ? `Day ${currentDay}` : "No cycle data"}</h2>
        <p className="message-pill cycle-pill">
          {currentPhase ?? "Add your cycle details to unlock phase guidance."}
        </p>
        <p className="muted">
          {phaseInfo}
        </p>
        <p className="muted">
          {nextPeriodDays !== null && nextPeriodDate
            ? `Next period in ${nextPeriodDays} days • ${nextPeriodDate}`
            : "Add cycle details to see your next prediction."}
        </p>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Calendar</p>
          <h2>Month view</h2>
          <p className="muted">Today, period days, and ovulation are highlighted dynamically.</p>
        </div>
        <CycleCalendar monthLabel={monthLabel} weekDays={weekDays} days={calendarDays} />
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Suggestions</p>
          <h2>Care for this phase</h2>
          <p className="muted">Small supportive ideas based on where you are in your cycle.</p>
        </div>
        <div className="history-list">
          {careSuggestions.map((item) => (
            <div key={item} className="history-row">
              <p className="history-label">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
