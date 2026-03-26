import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminWaterDashboard } from "@/components/water/AdminWaterDashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="theme-shell theme-home">
        <DashboardShell
          role="admin"
          title="Admin Dashboard"
          description="Monitor today&apos;s intake and manage the daily goal."
        >
          <AdminWaterDashboard />
        </DashboardShell>
      </div>
    </ProtectedRoute>
  );
}
