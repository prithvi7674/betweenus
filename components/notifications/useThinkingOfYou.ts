"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addThinkingEvent,
  subscribeToThinkingEvents,
  type ThinkingEvent,
} from "@/firebase/firestore";

const RECENT_WINDOW_MS = 5 * 60 * 1000;

export function useThinkingOfYou(currentUserEmail: string | null | undefined) {
  const [events, setEvents] = useState<ThinkingEvent[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToThinkingEvents((nextEvents) => {
      setEvents(nextEvents);
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

  const latestIncomingEvent = useMemo(() => {
    if (!currentUserEmail) {
      return null;
    }

    return (
      events.find(
        (event) =>
          event.sender !== currentUserEmail &&
          event.timestampMs !== null &&
          currentTimeMs - event.timestampMs <= RECENT_WINDOW_MS,
      ) ?? null
    );
  }, [currentTimeMs, currentUserEmail, events]);

  const sendThinkingOfYou = async () => {
    if (!currentUserEmail) {
      return;
    }

    setIsSending(true);

    try {
      await addThinkingEvent(currentUserEmail);
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    latestIncomingEvent,
    sendThinkingOfYou,
  };
}
