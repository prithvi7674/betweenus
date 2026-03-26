import { type ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UserNotificationCenter } from "@/components/layout/UserNotificationCenter";
import { BottomNav } from "@/components/navigation/BottomNav";

interface UserPageShellProps {
  title: string;
  description: string;
  theme: "home" | "water" | "mood" | "cycle" | "messages";
  children: ReactNode;
}

export function UserPageShell({
  title,
  description,
  theme,
  children,
}: UserPageShellProps) {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className={`theme-shell theme-${theme} min-h-screen relative overflow-visible`}>
        <DashboardShell
          role="user"
          title={title}
          description={description}
          theme={theme}
        >
          <section className="dashboard-grid user-page-grid app-screen pb-24 overflow-visible">
            <UserNotificationCenter />
            {children}
          </section>
        </DashboardShell>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
