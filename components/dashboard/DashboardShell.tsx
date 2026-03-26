"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useThinkingOfYou } from "@/components/notifications/useThinkingOfYou";
import { useAuth } from "@/components/providers/AuthProvider";
import { type UserRole } from "@/firebase/firestore";

interface DashboardShellProps {
  title: string;
  description: string;
  role: UserRole;
  theme?: "home" | "water" | "mood" | "cycle" | "messages";
  children?: ReactNode;
}

function getReadableName(email: string | null | undefined) {
  if (!email) {
    return "There";
  }

  const raw = email.split("@")[0] ?? "";
  const noNumbers = raw.replace(/[0-9]/g, "");
  const match = noNumbers.match(/[a-zA-Z]+$/);
  const name = (match ? match[0] : noNumbers).trim().toLowerCase();

  if (!name) {
    return "There";
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function DashboardShell(props: DashboardShellProps) {
  const { children } = props;
  const router = useRouter();
  const { profile, signOutUser } = useAuth();
  const { isSending, latestIncomingEvent, sendThinkingOfYou } =
    useThinkingOfYou(profile?.email);
  const displayName = getReadableName(profile?.email);

  const handleLogout = async () => {
    await signOutUser();
    router.replace("/login");
  };

  return (
    <main className="dashboard-shell overflow-visible">
      <section className="card dashboard-card">
        <div className="dashboard-header">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-[#1C1C1E]">
              Welcome {displayName}! 💖
            </h1>
            <p className="text-[#1C1C1E]/60">Glad you&apos;re here</p>
          </div>

          <div className="header-actions">
            <button
              className="secondary-button"
              onClick={sendThinkingOfYou}
              type="button"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Thinking of You 💖"}
            </button>
            <button className="secondary-button" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>

        {latestIncomingEvent ? (
          <div className="status-box info">Someone is thinking of you ❤️</div>
        ) : null}
      </section>

      {children}
    </main>
  );
}
