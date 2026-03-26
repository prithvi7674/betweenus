"use client";

import { useEffect, useState } from "react";
import {
  subscribeToGreetings,
  type GreetingMessage,
  type GreetingType,
} from "@/firebase/firestore";

function getGreetingTypeForCurrentTime(): GreetingType {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  return "evening";
}

export function usePersonalizedGreeting() {
  const [greeting, setGreeting] = useState("Hello ❤️");
  const [loading, setLoading] = useState(true);
  const greetingType = getGreetingTypeForCurrentTime();

  useEffect(() => {
    const unsubscribe = subscribeToGreetings(greetingType, (greetings) => {
      if (greetings.length === 0) {
        setGreeting("Hello ❤️");
        setLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * greetings.length);
      const selectedGreeting = greetings[randomIndex] as GreetingMessage | undefined;
      setGreeting(selectedGreeting?.text ?? "Hello ❤️");
      setLoading(false);
    });

    return unsubscribe;
  }, [greetingType]);

  return {
    greeting,
    greetingType,
    loading,
  };
}
