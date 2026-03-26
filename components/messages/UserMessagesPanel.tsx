"use client";

import { MessageCard } from "@/components/messages/MessageCard";
import { useMessages } from "@/components/messages/useMessages";

interface UserMessagesPanelProps {
  goalCompleted: boolean;
}

export function UserMessagesPanel({ goalCompleted }: UserMessagesPanelProps) {
  const { dailyMessage, latestMessages, newMessageIds, loading } = useMessages();

  return (
    <>
      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Daily Message</p>
          <h2>Today&apos;s note</h2>
          <p className="muted">A fresh message appears each day from the admin feed.</p>
        </div>

        {loading ? (
          <p className="muted">Loading messages...</p>
        ) : dailyMessage ? (
          <MessageCard
            message={dailyMessage}
            unlocked={goalCompleted}
            highlight
            isNew={newMessageIds.has(dailyMessage.id)}
          />
        ) : (
          <p className="muted">No messages yet.</p>
        )}
      </div>

      <div className="card water-form-card">
        <div className="title-stack compact">
          <p className="eyebrow">Latest Messages</p>
          <h2>Recent updates</h2>
          <p className="muted">New messages are highlighted, and locked notes open after goal completion.</p>
        </div>

        <div className="message-list">
          {loading ? (
            <p className="muted">Loading messages...</p>
          ) : latestMessages.length > 0 ? (
            latestMessages.map((message, index) => (
              <div
                key={message.id}
                className="slide-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <MessageCard
                  message={message}
                  unlocked={goalCompleted}
                  isNew={newMessageIds.has(message.id)}
                />
              </div>
            ))
          ) : (
            <p className="muted">No messages available yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
