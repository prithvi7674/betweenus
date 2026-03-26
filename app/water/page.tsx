import { UserPageShell } from "@/components/layout/UserPageShell";
import { WaterPageContent } from "@/components/water/WaterPageContent";

export default function WaterPage() {
  return (
    <UserPageShell
      title="Water Tracker"
      description="Log water, review your progress, and keep the habit feeling light."
      theme="water"
    >
      <WaterPageContent />
    </UserPageShell>
  );
}
