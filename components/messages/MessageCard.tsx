import { type AppMessage } from "@/firebase/firestore";

interface MessageCardProps {
  message: AppMessage;
  unlocked: boolean;
  highlight?: boolean;
  isNew?: boolean;
}

function formatTimestamp(timestampMs: number | null) {
  if (!timestampMs) {
    return "Just now";
  }

  return new Date(timestampMs).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageCard({
  message,
  unlocked,
  highlight = false,
  isNew = false,
}: MessageCardProps) {
  const isLocked = message.locked && !unlocked;

  return (
    <article
      className={`message-card${highlight ? " is-featured" : ""}${isLocked ? " is-locked" : ""}${isNew ? " is-new" : ""}`}
    >
      <div className="message-meta">
        <span className="message-author">
          {message.from === "admin" ? "From admin" : "From you"}
        </span>
        <div className="message-badges">
          {isNew ? <span className="message-badge new">New</span> : null}
          {message.locked ? (
            <span className={`message-badge${isLocked ? " locked" : " unlocked"}`}>
              {isLocked ? "Locked" : "Unlocked"}
            </span>
          ) : null}
        </div>
      </div>

      <p className="message-text">
        {isLocked ? "Complete your daily water goal to unlock this message." : message.text}
      </p>

      <p className="history-subtle">{formatTimestamp(message.timestampMs)}</p>
    </article>
  );
}
