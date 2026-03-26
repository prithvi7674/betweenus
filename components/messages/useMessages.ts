"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToMessages, type AppMessage } from "@/firebase/firestore";

const NEW_MESSAGE_WINDOW_MS = 24 * 60 * 60 * 1000;

function getDailyMessage(messages: AppMessage[]) {
  if (messages.length === 0) {
    return null;
  }

  const seed = new Date().toISOString().split("T")[0];
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return messages[hash % messages.length] ?? null;
}

export function useMessages() {
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToMessages((nextMessages) => {
      setMessages(nextMessages);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const dailyMessage = useMemo(() => getDailyMessage(messages), [messages]);
  const latestMessages = useMemo(() => messages.slice(0, 6), [messages]);
  const newMessageIds = useMemo(
    () =>
      new Set(
        messages
          .filter(
            (message) =>
              message.timestampMs !== null &&
              currentTimeMs - message.timestampMs <= NEW_MESSAGE_WINDOW_MS,
          )
          .map((message) => message.id),
      ),
    [currentTimeMs, messages],
  );

  return {
    messages,
    latestMessages,
    dailyMessage,
    newMessageIds,
    loading,
  };
}
