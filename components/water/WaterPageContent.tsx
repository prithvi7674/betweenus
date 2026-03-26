"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import { db, subscribeToWaterSettings } from "@/firebase/firestore";

interface WaterEntry {
  id: string;
  amount: number;
  time: string;
  createdAtMs: number;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function WaterPageContent() {
  const { user } = useAuth();
  const [currentAmount, setCurrentAmount] = useState(0);
  const [goalAmount, setGoalAmount] = useState(2000);
  const [logs, setLogs] = useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const unsubscribe = subscribeToWaterSettings(user.email, (settings) => {
      setGoalAmount(settings?.dailyGoal ?? 2000);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    let isMounted = true;

    const fetchWaterLogs = async () => {
      setIsLoading(true);

      try {
        const logsQuery = query(
          collection(db, "waterLogs"),
          where("userEmail", "==", user.email),
          where("date", "==", today),
        );
        const snapshot = await getDocs(logsQuery);
        console.log(snapshot.docs);

        if (!isMounted) {
          return;
        }

        const nextLogs = snapshot.docs
          .map((item) => {
            const data = item.data();
            const createdAtDate =
              data.createdAt && typeof data.createdAt.seconds === "number"
                ? new Date(data.createdAt.seconds * 1000)
                : new Date();

            return {
              id: item.id,
              amount: typeof data.amount === "number" ? data.amount : 0,
              time: formatTime(createdAtDate),
              createdAtMs: createdAtDate.getTime(),
            } satisfies WaterEntry;
          })
          .sort((left, right) => right.createdAtMs - left.createdAtMs);

        setLogs(nextLogs);
        setCurrentAmount(nextLogs.reduce((sum, item) => sum + item.amount, 0));
      } catch {
        if (isMounted) {
          setLogs([]);
          setCurrentAmount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchWaterLogs();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const addWater = (amount: number) => {
    if (!user?.email) {
      return;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const optimisticLog: WaterEntry = {
      id: `optimistic-${now.getTime()}`,
      amount,
      time: formatTime(now),
      createdAtMs: now.getTime(),
    };

    setCurrentAmount((prev) => prev + amount);
    setLogs((prev) => [optimisticLog, ...prev]);

    startTransition(async () => {
      try {
        const docRef = await addDoc(collection(db, "waterLogs"), {
          userEmail: user.email,
          amount,
          date: today,
          createdAt: now,
        });

        setLogs((prev) =>
          prev.map((item) =>
            item.id === optimisticLog.id ? { ...item, id: docRef.id } : item,
          ),
        );
      } catch {
        setCurrentAmount((prev) => Math.max(prev - amount, 0));
        setLogs((prev) => prev.filter((item) => item.id !== optimisticLog.id));
        console.error("Unable to save your water intake right now.");
      }
    });
  };

  const progress = useMemo(() => {
    if (goalAmount <= 0) {
      return 0;
    }

    return Math.min(currentAmount / goalAmount, 1);
  }, [currentAmount, goalAmount]);

  const circumference = 2 * Math.PI * 88;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF4FF] to-[#CDE7FF]">
      <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-40 pt-6">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-[#1C1C1E]">Hydration 💧</h1>
          <p className="text-lg text-[#1C1C1E]/60">Stay refreshed today</p>
        </div>

        <div className="mb-6 rounded-[1.75rem] bg-white/80 p-8 shadow-sm shadow-black/5 backdrop-blur-xl">
          <div className="flex flex-col items-center">
            <div className="relative mb-6 h-56 w-56">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="88"
                  stroke="#D6EAF8"
                  strokeWidth="12"
                  fill="none"
                />
                <defs>
                  <linearGradient id="hydrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={progress >= 1 ? "#6BCB77" : "#4A90E2"} />
                    <stop offset="100%" stopColor={progress >= 1 ? "#57B86A" : "#6FA8DC"} />
                  </linearGradient>
                </defs>
                <circle
                  cx="112"
                  cy="112"
                  r="88"
                  stroke="url(#hydrationGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  className="transition-all duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#1C1C1E]">
                  {isLoading ? "..." : `${currentAmount} ml`}
                </span>
                <span className="mt-1 text-sm text-[#1C1C1E]/50">
                  of {goalAmount} ml goal
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-[#1C1C1E]/55">
              {Math.round(progress * 100)}% of your hydration goal
            </p>
            {progress >= 1 ? (
              <p className="mt-2 text-base font-semibold text-[#4F9F5D]">
                Goal Completed 🎉
              </p>
            ) : null}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => addWater(250)}
            disabled={isPending}
            className="bg-gradient-to-br from-[#4A90E2] to-[#6FA8DC] text-white rounded-xl py-4 font-semibold shadow-md active:scale-95 transition-all duration-200 disabled:opacity-70"
          >
            +250 ml
          </button>
          <button
            onClick={() => addWater(500)}
            disabled={isPending}
            className="bg-gradient-to-br from-[#4A90E2] to-[#6FA8DC] text-white rounded-xl py-4 font-semibold shadow-md active:scale-95 transition-all duration-200 disabled:opacity-70"
          >
            +500 ml
          </button>
        </div>

        <div className="flex-1 overflow-hidden rounded-[1.75rem] bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#1C1C1E]">Today</h2>
          <span className="text-sm text-[#1C1C1E]/45">{logs.length} logs</span>
        </div>

          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-[#1C1C1E]/5 py-2 last:border-0"
              >
                <span className="font-medium text-[#1C1C1E]">{log.amount} ml</span>
                <span className="text-sm text-[#1C1C1E]/50">{log.time}</span>
              </div>
            ))}

            {!isLoading && logs.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#1C1C1E]/45">
                No water logged yet today.
              </p>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => addWater(250)}
          disabled={isPending}
          className="fixed bottom-24 left-1/2 z-20 -translate-x-1/2 bg-gradient-to-r from-[#4A90E2] to-[#6FA8DC] text-white rounded-full px-8 py-4 font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-all duration-200 disabled:opacity-70"
        >
          + Add Water
        </button>
      </div>
    </div>
  );
}
