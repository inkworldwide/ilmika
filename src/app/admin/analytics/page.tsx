"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Users, Building, AlertTriangle, MessageSquare, CalendarRange, CheckCircle2, FileEdit } from "lucide-react";

interface Metrics {
  totalUsers: number;
  totalProperties: number;
  draftCount: number;
  pendingCount: number;
  activeCount: number;
  enquiriesCount: number;
  visitsCount: number;
  reportsCount: number;
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading platform analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-xs text-slate-400 py-10 text-center">
        Failed to load analytics metrics.
      </div>
    );
  }

  const statCards = [
    {
      title: "Registered Users",
      value: metrics.totalUsers,
      desc: "Owners, Seekers, Agents, and Admins",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Total Listings",
      value: metrics.totalProperties,
      desc: "All properties stored in PostgreSQL",
      icon: Building,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Active Properties",
      value: metrics.activeCount,
      desc: "Searchable and verified live listings",
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      title: "Pending Verification",
      value: metrics.pendingCount,
      desc: "Properties waiting moderation approval",
      icon: FileEdit,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Listing Reports",
      value: metrics.reportsCount,
      desc: "Moderation flags filed by seekers",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600 border-red-100",
    },
    {
      title: "Enquiry Leads",
      value: metrics.enquiriesCount,
      desc: "Total contact enquiries submitted",
      icon: MessageSquare,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Visits & Tours",
      value: metrics.visitsCount,
      desc: "Total booked visit requests",
      icon: CalendarRange,
      color: "bg-teal-50 text-teal-600 border-teal-100",
    },
    {
      title: "Draft Listings",
      value: metrics.draftCount,
      desc: "Unpublished property listing drafts",
      icon: FileEdit,
      color: "bg-slate-50 text-slate-500 border-slate-100",
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-accent" /> Platform Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-1">Audit overall system performance, total listings, leads generation, and active user metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white border border-line rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${c.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">{c.title}</p>
                <p className="font-mono text-xl font-bold text-primary">{c.value.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 font-medium">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bars / Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings Breakdown */}
        <div className="bg-white border border-line rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary">Listing Status Breakdown</h3>
          <div className="space-y-3.5 text-xs">
            {/* Active */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Active Listings</span>
                <span className="font-mono">{metrics.activeCount} ({metrics.totalProperties ? ((metrics.activeCount / metrics.totalProperties) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: `${metrics.totalProperties ? (metrics.activeCount / metrics.totalProperties) * 100 : 0}%` }}></div>
              </div>
            </div>
            {/* Pending */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Pending Verification</span>
                <span className="font-mono">{metrics.pendingCount} ({metrics.totalProperties ? ((metrics.pendingCount / metrics.totalProperties) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.totalProperties ? (metrics.pendingCount / metrics.totalProperties) * 100 : 0}%` }}></div>
              </div>
            </div>
            {/* Draft */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Drafts &amp; Others</span>
                <span className="font-mono">{metrics.draftCount} ({metrics.totalProperties ? ((metrics.draftCount / metrics.totalProperties) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${metrics.totalProperties ? (metrics.draftCount / metrics.totalProperties) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white border border-line rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary">System Engagement Overview</h3>
          <div className="space-y-3.5 text-xs font-semibold text-slate-600">
            <div className="flex justify-between py-1 border-b border-line">
              <span>Leads per Active Property</span>
              <span className="font-mono text-primary">
                {metrics.activeCount ? (metrics.enquiriesCount / metrics.activeCount).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line">
              <span>Visits per Active Property</span>
              <span className="font-mono text-primary">
                {metrics.activeCount ? (metrics.visitsCount / metrics.activeCount).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line">
              <span>Reports Ratio (Flagged/Active)</span>
              <span className="font-mono text-primary">
                {metrics.activeCount ? ((metrics.reportsCount / metrics.activeCount) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
