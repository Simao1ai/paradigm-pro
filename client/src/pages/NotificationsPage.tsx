import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bell, CheckCheck, Loader2, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  lesson_reminder: "📚",
  achievement: "🏆",
  session_scheduled: "📅",
  session_reminder: "⏰",
  new_message: "💬",
  streak_alert: "🔥",
  weekly_checkin: "✅",
  broadcast: "📢",
  roadmap_reminder: "🗺️",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=50", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error("Failed to mark notifications");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId: id }),
      });
      if (!res.ok) throw new Error("Failed to mark notification");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-muted-foreground">Failed to load notifications</p>
        </div>
      </div>
    );
  }

  const notifList = notifications || [];
  const unreadCount = notifList.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-2 text-sm text-brand-gold hover:text-brand-gold-light transition-colors disabled:opacity-60"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifList.length === 0 ? (
        <div className="text-center py-16 card-glass">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifList.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              className={`card-glass p-4 cursor-pointer transition-all
                ${!n.isRead ? "border-brand-gold/20 bg-brand-gold/5" : "opacity-70 hover:opacity-100"}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${n.isRead ? "text-muted-foreground" : "text-white"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-gold flex-shrink-0 mt-1" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {n.actionUrl && (
                      <Link
                        href={n.actionUrl}
                        className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
