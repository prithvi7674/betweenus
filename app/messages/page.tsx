import { UserPageShell } from "@/components/layout/UserPageShell";
import { MessagesPageContent } from "@/components/messages/MessagesPageContent";

export default function MessagesPage() {
  return (
    <UserPageShell
      title="Messages"
      description="Stay close through daily notes, hidden messages, and real-time moments."
      theme="messages"
    >
      <MessagesPageContent />
    </UserPageShell>
  );
}
