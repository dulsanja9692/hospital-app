"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Bell, Calendar, Clock, Check, Trash2, Loader2, Filter } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage, cn } from "@/lib/utils";
import dayjs from "dayjs";

interface Notification {
  id: string;
  msg: string;
  type: "appointment" | "reminder" | "alert" | string;
  status: "read" | "unread";
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  appointment: { icon: <Calendar className="w-4 h-4" />, color: "text-blue-600",  bg: "bg-blue-100 dark:bg-blue-900/30" },
  reminder:    { icon: <Clock    className="w-4 h-4" />, color: "text-orange-600",bg: "bg-orange-100 dark:bg-orange-900/30" },
  alert:       { icon: <Bell     className="w-4 h-4" />, color: "text-red-600",   bg: "bg-red-100 dark:bg-red-900/30" },
};

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "50" };
      if (filter !== "all") params.status = filter;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get("notifications", { params });
      setNotifications(res.data.data ?? []);
    } catch {
      // Show mock data if API not ready
      setNotifications([
        { id: "1", msg: "Appointment confirmed for Dr. Silva at 6:00 PM", type: "appointment", status: "unread", created_at: new Date().toISOString() },
        { id: "2", msg: "Reminder: Patient Kamal Perera has an appointment in 1 hour", type: "reminder", status: "unread", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: "3", msg: "Appointment cancelled by patient #APT-00123", type: "alert", status: "read", created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: "4", msg: "New appointment booked for Dr. Amara — Queue #5", type: "appointment", status: "read", created_at: new Date(Date.now() - 172800000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter]);

  useEffect(() => { if (user) fetchNotifications(); }, [user, fetchNotifications]);

  async function markRead(id: string) {
    try {
      await api.patch(`/notifications/${id}`, { status: "read" }).catch(() => {});
      setNotifications((n) => n.map((x) => x.id === id ? { ...x, status: "read" } : x));
    } catch { /* ignore */ }
  }

  async function markAllRead() {
    try {
      await api.patch("notifications/read-all").catch(() => {});
      setNotifications((n) => n.map((x) => ({ ...x, status: "read" })));
      toast.success("All marked as read");
    } catch { /* ignore */ }
  }

  async function deleteNotification(id: string) {
    try {
      await api.delete(`/notifications/${id}`).catch(() => {});
      setNotifications((n) => n.filter((x) => x.id !== id));
    } catch { /* ignore */ }
  }

  if (authLoading) return null;

  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const displayed = notifications.filter((n) => {
    if (filter === "unread") return n.status === "unread";
    if (filter === "read")   return n.status === "read";
    return true;
  }).filter((n) => !typeFilter || n.type === typeFilter);

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000)   return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)return `${Math.floor(diff / 3600000)}h ago`;
    return dayjs(date).format("MMM D, YYYY");
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize",
              filter === f ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200")}>
            {f}
          </button>
        ))}
        <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
        {["", "appointment", "reminder", "alert"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn("px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize",
              typeFilter === t ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200")}>
            {t || "All types"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {displayed.map((n) => {
              const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.alert;
              return (
                <div key={n.id}
                  className={cn("flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group",
                    n.status === "unread" && "bg-blue-50/40 dark:bg-blue-900/5")}>
                  {/* Icon */}
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", config.bg, config.color)}>
                    {config.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-relaxed", n.status === "unread" ? "font-semibold text-gray-900" : "text-gray-600")}>
                      {n.msg}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", config.bg, config.color)}>
                        {n.type}
                      </span>
                      {n.status === "unread" && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">New</span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {n.status === "unread" && (
                      <button onClick={() => markRead(n.id)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Unread dot */}
                  {n.status === "unread" && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}