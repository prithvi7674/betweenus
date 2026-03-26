import { UserHomeSummary } from "@/components/home/UserHomeSummary";
import { UserPageShell } from "@/components/layout/UserPageShell";

export default function HomePage() {
  return (
    <UserPageShell
      title="Daily Summary"
      description="A soft overview of your day across hydration, mood, cycle, and messages."
      theme="home"
    >
      <UserHomeSummary />
    </UserPageShell>
  );
}
