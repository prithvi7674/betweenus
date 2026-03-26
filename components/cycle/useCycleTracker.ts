"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { predictCycle } from "@/components/cycle/cycleInsights";
import { db, type CycleSettings } from "@/firebase/firestore";

export function useCycleTracker(userEmail: string | null | undefined) {
  const [cycleState, setCycleState] = useState<{
    email: string | null;
    settings: CycleSettings | null;
  }>({
    email: null,
    settings: null,
  });
  const [loading, setLoading] = useState(Boolean(userEmail));

  useEffect(() => {
    if (!userEmail) {
      setCycleState({ email: null, settings: null });
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCycleSettings = async () => {
      setLoading(true);

      try {
        const cycleQuery = query(
          collection(db, "cycles"),
          where("userEmail", "==", userEmail),
        );
        const snapshot = await getDocs(cycleQuery);

        if (!isMounted) {
          return;
        }

        if (snapshot.empty) {
          setCycleState({ email: userEmail, settings: null });
          return;
        }

        const data = snapshot.docs[0].data();

        if (
          typeof data.userEmail !== "string" ||
          typeof data.lastPeriodDate !== "string" ||
          typeof data.cycleLength !== "number"
        ) {
          setCycleState({ email: userEmail, settings: null });
          return;
        }

        setCycleState({
          email: userEmail,
          settings: {
            userEmail: data.userEmail,
            lastPeriodDate: data.lastPeriodDate,
            cycleLength: data.cycleLength,
          },
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchCycleSettings();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  const settings =
    userEmail && cycleState.email === userEmail ? cycleState.settings : null;
  const prediction = predictCycle(settings);

  return {
    settings,
    loading,
    ...prediction,
  };
}
