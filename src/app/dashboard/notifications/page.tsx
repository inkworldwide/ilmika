"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, RefreshCw, AlertCircle, Info, Trash2, Trash } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id?: string) => {
    try {
      const query = id ? `?id=${id}` : "";
      const res = await fetch(`/api/notifications${query}`, { method: "PUT" });
      if (res.ok) {
        if (id) {
          setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const deleted = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications? This cannot be undone.")) return;
    setClearingAll(true);
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-line pb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Notifications</h2>
          <p className="text-xs text-slate-500 mt-1">Review alerts, visit bookings, and direct messages.</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => handleMarkAsRead()}
              type="button"
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              type="button"
              className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Trash className="w-4 h-4" />
              {clearingAll ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Bell className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">Inbox is empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We will notify you here when you receive enquiries, chat messages, or status updates on your bookings.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line/60">
          {notifications.map((n) => {
            const dateStr = new Date(n.createdAt).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric",
              hour: "numeric", minute: "numeric", hour12: true,
            });

            return (
              <div
                key={n.id}
                className={`py-4 flex items-start gap-3.5 transition group ${
                  !n.isRead ? "bg-accent/5 -mx-6 px-6 font-medium" : ""
                }`}
              >
                {/* Icon matching Type */}
                <div className={`w-8.5 h-8.5 rounded-full grid place-items-center shrink-0 ${
                  !n.isRead ? "bg-accent/15 text-primary" : "bg-secondary text-slate-400"
                }`}>
                  {n.type.includes("VISIT") ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : n.type === "ENQUIRY" ? (
                    <Info className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 text-xs min-w-0">
                  <p className="text-primary leading-normal">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{dateStr}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Mark as read */}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      type="button"
                      className="w-7 h-7 border border-line rounded-full grid place-items-center hover:bg-white text-slate-400 hover:text-accent transition cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={deletingId === n.id}
                    type="button"
                    className="w-7 h-7 border border-line rounded-full grid place-items-center hover:bg-red-50 hover:border-red-200 text-slate-300 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                    title="Delete notification"
                  >
                    {deletingId === n.id ? (
                      <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
