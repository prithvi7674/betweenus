"use client";

import { FormEvent, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { addMoodLog, getTodayDateString, type MoodType } from "@/firebase/firestore";
import { MoodHistoryList } from "@/components/mood/MoodHistoryList";
import { moodOptions } from "@/components/mood/moodInsights";
import { useMoodTracker } from "@/components/mood/useMoodTracker";

export function UserMoodPanel() {
  const { profile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { todayLog, history, moodResponse, loading } = useMoodTracker(profile?.email);
  const activeMood = selectedMood ?? todayLog?.mood ?? "okay";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!profile?.email) {
      setError("No user email found for this account.");
      return;
    }

    if (!selectedMood) {
      setError("Choose a mood before saving.");
      return;
    }

    startTransition(async () => {
      try {
        await addMoodLog({
          userEmail: profile.email,
          mood: selectedMood,
          note: note.trim(),
          date: getTodayDateString(),
        });
        setNote("");
      } catch {
        setError("Unable to save your mood right now.");
      }
    });
  };

  return (
    <>
      <div className={`card water-form-card mood-panel mood-${activeMood}`}>
        <div className="title-stack compact">
          <p className="eyebrow">Mood Check-In</p>
          <h2>How are you feeling?</h2>
          <p className="muted">Pick a mood and add an optional note for today.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mood-grid">
            {moodOptions.map((option) => (
              <button
                key={option.mood}
                type="button"
                className={`mood-button${selectedMood === option.mood ? " is-selected" : ""}`}
                onClick={() => setSelectedMood(option.mood)}
              >
                <span className="mood-emoji">{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="mood-note">Note (optional)</label>
            <input
              id="mood-note"
              type="text"
              placeholder="Want to remember what shaped today?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          {error ? <div className="status-box error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save mood"}
          </button>
        </form>
      </div>

      <div className="card stat-card">
        <p className="eyebrow">Today&apos;s Mood</p>
        <h2>
          {loading
            ? "Loading..."
            : todayLog
              ? moodOptions.find((option) => option.mood === todayLog.mood)?.label
              : "No mood logged"}
        </h2>
        <p className="message-pill mood-response">{moodResponse}</p>
        {todayLog?.note ? <p className="muted mood-note">{todayLog.note}</p> : null}
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Mood History</p>
          <h2>Last 7 days</h2>
          <p className="muted">Your recent emotional check-ins, one day at a time.</p>
        </div>
        <MoodHistoryList history={history} />
      </div>
    </>
  );
}
