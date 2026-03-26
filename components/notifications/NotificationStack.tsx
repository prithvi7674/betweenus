import { type GentleNotification } from "@/components/notifications/useGentleNotifications";

interface NotificationStackProps {
  notifications: GentleNotification[];
}

export function NotificationStack({ notifications }: NotificationStackProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className="soft-toast">
          <p className="soft-toast-title">{notification.title}</p>
          <p className="soft-toast-body">{notification.body}</p>
        </div>
      ))}
    </div>
  );
}
