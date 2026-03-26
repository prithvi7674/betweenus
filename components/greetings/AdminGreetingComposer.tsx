"use client";

import { FormEvent, useState, useTransition } from "react";
import { addGreeting, type GreetingType } from "@/firebase/firestore";

const greetingOptions: GreetingType[] = ["morning", "afternoon", "evening"];

export function AdminGreetingComposer() {
  const [text, setText] = useState("");
  const [type, setType] = useState<GreetingType>("morning");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!text.trim()) {
      setError("Enter a greeting message.");
      return;
    }

    startTransition(async () => {
      try {
        await addGreeting({
          text: text.trim(),
          type,
        });
        setText("");
        setSuccess("Greeting saved.");
      } catch {
        setError("Unable to save the greeting right now.");
      }
    });
  };

  return (
    <div className="card admin-panel-card">
      <div className="title-stack compact">
        <p className="eyebrow">Personal Greeting</p>
        <h2>Add a dynamic greeting</h2>
        <p className="muted">
          These greetings rotate on the home page based on the time of day.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="greeting-text">Greeting message</label>
          <input
            id="greeting-text"
            type="text"
            placeholder="Good Morning Babe ❤️"
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="greeting-type">Time of day</label>
          <select
            id="greeting-type"
            className="soft-select"
            value={type}
            onChange={(event) => setType(event.target.value as GreetingType)}
          >
            {greetingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {error ? <div className="status-box error">{error}</div> : null}
        {success ? <div className="status-box info">{success}</div> : null}

        <button className="primary-button" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save greeting"}
        </button>
      </form>
    </div>
  );
}
