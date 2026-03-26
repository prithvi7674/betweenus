"use client";

import { FormEvent, useState, useTransition } from "react";
import { addMessage } from "@/firebase/firestore";

export function AdminMessageComposer() {
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!text.trim()) {
      setError("Enter a message before sending.");
      return;
    }

    startTransition(async () => {
      try {
        await addMessage({
          text: text.trim(),
          from: "admin",
          locked,
        });

        setText("");
        setLocked(false);
        setSuccess("Message sent.");
      } catch {
        setError("Unable to send the message right now.");
      }
    });
  };

  return (
    <div className="card water-form-card">
      <div className="title-stack compact">
        <p className="eyebrow">Admin Message</p>
        <h2>Send a message</h2>
        <p className="muted">Share a daily note, encouragement, or a hidden reward message.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="message-text">Message</label>
          <input
            id="message-text"
            type="text"
            placeholder="Keep going, you're doing great."
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
          />
        </div>

        <label className="toggle-row" htmlFor="message-locked">
          <input
            id="message-locked"
            type="checkbox"
            checked={locked}
            onChange={(event) => setLocked(event.target.checked)}
          />
          <span>Lock this message until the daily water goal is completed</span>
        </label>

        {error ? <div className="status-box error">{error}</div> : null}
        {success ? <div className="status-box info">{success}</div> : null}

        <button className="primary-button" type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  );
}
