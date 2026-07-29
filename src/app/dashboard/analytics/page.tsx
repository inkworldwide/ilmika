"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Eye, Mail, CalendarRange, TrendingUp, Building2 } from "lucide-react";

interface AnalyticsData {
  summary: {
    totalProperties: number;
    activeProperties: number;
    pendingProperties: number;
    draftProperties: number;
    rentProperties: number;
    saleProperties: number;
    leaseProperties: number;
    enquiriesCount: number;
    visitsCount: number;
    totalViews: number;
  };
  topProperties: Array<{
    title: string;
    views: number;
    enquiries: number;
    visits: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    views: number;
    leads: number;
  }>;
}

export default function DashboardAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/dashboard/analytics");
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Calculating metrics...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, topProperties, monthlyTrends } = data;

  // Find max views in monthlyTrends to calculate relative height percentages
  const maxViewsInTrend = Math.max(...monthlyTrends.map(t => t.views), 1);
  const maxViewsInTop = Math.max(...topProperties.map(p => p.views), 1);

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Leads &amp; Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">Monitor page traffic, property reach, and user engagement metrics.</p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-secondary/40 border border-line rounded-xl p-4.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-mono font-bold text-primary">{summary.totalViews}</p>
          <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% this week
          </span>
        </div>

        <div className="bg-secondary/40 border border-line rounded-xl p-4.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Enquiries</span>
            <Mail className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-mono font-bold text-primary">{summary.enquiriesCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">Conversion rate 3.4%</span>
        </div>

        <div className="bg-secondary/40 border border-line rounded-xl p-4.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Tour Bookings</span>
            <CalendarRange className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-mono font-bold text-primary">{summary.visitsCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 font-medium"> Toured visits pending</span>
        </div>

        <div className="bg-secondary/40 border border-line rounded-xl p-4.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">My Listings</span>
            <Building2 className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-mono font-bold text-primary">{summary.totalProperties}</p>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">{summary.activeProperties} Active listings</span>
        </div>
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Chart 1: Monthly Traffic Trend Bar Graph */}
        <div className="border border-line rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-serif text-sm font-semibold text-primary">Views Traffic Trend</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Estimated view impressions for the last 6 months.</p>
          </div>

          <div className="h-44 flex items-end justify-between pt-6 border-b border-line px-2">
            {monthlyTrends.map((trend) => {
              const pct = (trend.views / maxViewsInTrend) * 100;
              return (
                <div key={trend.month} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                  <div className="w-8 sm:w-10 bg-primary/10 hover:bg-primary transition rounded-t relative flex items-end" style={{ height: `120px` }}>
                    <div className="w-full bg-accent rounded-t hover:bg-accent-hover transition" style={{ height: `${pct}%` }}>
                      {/* Tooltip */}
                      <span className="absolute -top-6 left-50% -translate-x-50% bg-primary text-secondary text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {trend.views} views
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{trend.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top properties horizontal list */}
        <div className="border border-line rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-serif text-sm font-semibold text-primary">Top Performing Listings</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Most viewed properties on your dashboard.</p>
          </div>

          <div className="space-y-4 pt-2">
            {topProperties.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No listings views logged yet.</p>
            ) : (
              topProperties.map((p, idx) => {
                const ratio = (p.views / maxViewsInTop) * 100;
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-primary truncate max-w-[70%]">{p.title}</span>
                      <span className="font-mono text-slate-400">{p.views} views</span>
                    </div>
                    {/* Progress Bar wrapper */}
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent hover:bg-accent-hover transition-all duration-500 rounded-full" style={{ width: `${ratio}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
