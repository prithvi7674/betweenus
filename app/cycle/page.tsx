import { UserPageShell } from "@/components/layout/UserPageShell";
import { UserCyclePanel } from "@/components/cycle/UserCyclePanel";

export default function CyclePage() {
  return (
    <UserPageShell
      title="Cycle Tracker"
      description="See your current phase, predicted dates, and a calm timeline view."
      theme="cycle"
    >
      <UserCyclePanel />
    </UserPageShell>
  );
}
