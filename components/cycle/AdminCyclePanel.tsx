"use client";

import { CycleCalendar } from "@/components/cycle/CycleCalendar";
import { useCycleTracker } from "@/components/cycle/useCycleTracker";
import { useAuth } from "@/components/providers/AuthProvider";

export function AdminCyclePanel() {
  const { profile } = useAuth();
  const {
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

  return (
    <>
      <div className="card stat-card">
        <p className="eyebrow">Cycle Phase</p>
        <h2>{loading ? "Loading..." : currentDay ? `Day ${currentDay}` : "No cycle data"}</h2>
        <p className="message-pill cycle-pill">
          {currentPhase ?? "No current phase available yet."}
        </p>
        <p className="muted">{phaseInfo}</p>
        <p className="muted">
          {nextPeriodDays !== null && nextPeriodDate
            ? `Next period in ${nextPeriodDays} days • ${nextPeriodDate}`
            : "No cycle data saved yet."}
        </p>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Care Suggestion</p>
          <h2>Support note</h2>
          <p className="muted">Thoughtful guidance based on the current phase.</p>
        </div>
        <div className="history-list">
          {careSuggestions.map((item) => (
            <div key={item} className="history-row">
              <p className="history-label">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Cycle Calendar</p>
          <h2>Month view</h2>
          <p className="muted">Current month with predicted period and ovulation highlights.</p>
        </div>
        <CycleCalendar monthLabel={monthLabel} weekDays={weekDays} days={calendarDays} />
      </div>
    </>
  );
}
