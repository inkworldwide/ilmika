"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, RefreshCw, AlertCircle, Info } from "lucide-react";

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
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-line pb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Notifications</h2>
          <p className="text-xs text-slate-500 mt-1">Review alerts, visit bookings, and direct messages.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => handleMarkAsRead()}
            type="button"
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
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
              year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true
            });

            return (
              <div 
                key={n.id} 
                className={`py-4 flex items-start gap-3.5 transition ${
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

                {/* Body details */}
                <div className="flex-1 text-xs">
                  <p className="text-primary leading-normal">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{dateStr}</p>
                </div>

                {/* Read toggle */}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    type="button"
                    className="w-7 h-7 border border-line rounded-full grid place-items-center hover:bg-white text-slate-400 hover:text-accent transition shrink-0 cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
