"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Eye, Mail, CalendarRange, Heart, 
  Clock, Bell, Plus, CheckCircle, ChevronRight, User 
} from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) return;
        const meData = await meRes.json();
        setUser(meData.user);

        if (meData.user.role !== "USER") {
          // Fetch analytics for owners/agents
          const analyticRes = await fetch("/api/dashboard/analytics");
          if (analyticRes.ok) {
            const analyticalData = await analyticRes.json();
            setStats(analyticalData.summary);
          }
        } else {
          // Fetch seeker counts
          const [savedRes, enqRes, visitRes] = await Promise.all([
            fetch("/api/dashboard/saved"),
            fetch("/api/dashboard/enquiries"),
            fetch("/api/dashboard/visits"),
          ]);
          
          const savedData = await savedRes.json();
          const enqData = await enqRes.json();
          const visitData = await visitRes.json();

          setStats({
            savedCount: savedData.properties?.length || 0,
            enquiriesCount: enqData.enquiries?.length || 0,
            visitsCount: visitData.visits?.length || 0,
          });
        }
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading overview details...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-secondary/40 border border-line rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Welcome back, {user.name.split(" ")[0]}!</h2>
          <p className="text-xs text-slate-500 mt-1">Here is a quick look at your property activity today.</p>
        </div>

        {user.role !== "USER" && (
          <Link
            href="/properties/add"
            className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4.5 py-2.5 rounded-full shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Property
          </Link>
        )}
      </div>

      {/* Account Verification notice */}
      {!user.isEmailVerified && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Verify your email address</p>
            <p className="text-amber-700/80 mt-0.5">Please check your inbox to verify your email. Unverified profiles have restricted posting privileges.</p>
          </div>
        </div>
      )}

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {user.role === "USER" ? (
          // USER / Seeker Stats
          <>
            <div className="bg-secondary border border-line rounded-xl p-5 shadow-xs">
              <Heart className="w-8 h-8 text-accent mb-3" />
              <p className="text-2xl font-mono font-bold text-primary">{stats?.savedCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Shortlisted Properties</p>
            </div>

            <div className="bg-secondary border border-line rounded-xl p-5 shadow-xs">
              <Mail className="w-8 h-8 text-accent mb-3" />
              <p className="text-2xl font-mono font-bold text-primary">{stats?.enquiriesCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Sent Enquiries</p>
            </div>

            <div className="bg-secondary border border-line rounded-xl p-5 shadow-xs">
              <CalendarRange className="w-8 h-8 text-accent mb-3" />
              <p className="text-2xl font-mono font-bold text-primary">{stats?.visitsCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Scheduled Visits</p>
            </div>
          </>
        ) : (
          // OWNER / AGENT / ADMIN Stats
          <>
            <div className="bg-secondary border border-line rounded-xl p-5 shadow-xs">
              <Building2 className="w-8 h-8 text-accent mb-3" />
              <p className="text-2xl font-mono font-bold text-primary">{stats?.totalProperties || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Listings ({stats?.activeProperties || 0} Active)</p>
            </div>

            <div className="bg-secondary border border-line rounded-xl p-5 shadow-xs">
              <Eye className="w-8 h-8 text-accent mb-3" />
              <p className="text-2xl font-mono font-bold text-primary">{stats?.totalViews || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Views generated</p>
            </div>

            <div className="bg-secondary border border-line rounded-xl p-5 shadow-xs">
              <Mail className="w-8 h-8 text-accent mb-3" />
              <p className="text-2xl font-mono font-bold text-primary">{stats?.enquiriesCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Enquiries &amp; Leads</p>
            </div>
          </>
        )}
      </div>

      {/* Quick shortcuts block */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-primary">Quick Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-between border border-line hover:border-accent p-4.5 rounded-xl transition bg-white"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-slate-700">Edit Profile &amp; Avatar</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>

          <Link
            href="/dashboard/messages"
            className="flex items-center justify-between border border-line hover:border-accent p-4.5 rounded-xl transition bg-white"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-slate-700">Open Inbox Chats</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
