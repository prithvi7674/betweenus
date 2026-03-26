import { UserPageShell } from "@/components/layout/UserPageShell";
import { UserMoodPanel } from "@/components/mood/UserMoodPanel";

export default function MoodPage() {
  return (
    <UserPageShell
      title="Mood Tracker"
      description="Check in with your emotions and keep a gentle record of the week."
      theme="mood"
    >
      <UserMoodPanel />
    </UserPageShell>
  );
}
