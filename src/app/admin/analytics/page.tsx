"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  Users,
  GraduationCap,
  AlertTriangle,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Summary {
  totalUsers: number;
  totalColleges: number;
  pendingVerifications: number;
  activeColleges: number;
  totalApplications: number;
  totalEnquiries: number;
  totalReports: number;
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
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

  if (!summary) {
    return (
      <div className="text-xs text-slate-400 py-10 text-center">
        Failed to load analytics data.
      </div>
    );
  }

  const statCards = [
    {
      title: "Registered Users",
      value: summary.totalUsers,
      desc: "Students, Advisors & Admins",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Total Colleges",
      value: summary.totalColleges,
      desc: "All colleges in the platform",
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Active Colleges",
      value: summary.activeColleges,
      desc: "Verified & live on platform",
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      title: "Pending Verification",
      value: summary.pendingVerifications,
      desc: "Colleges awaiting approval",
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Applications",
      value: summary.totalApplications,
      desc: "Student applications submitted",
      icon: FileText,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Enquiries",
      value: summary.totalEnquiries,
      desc: "College enquiries received",
      icon: MessageSquare,
      color: "bg-teal-50 text-teal-600 border-teal-100",
    },
    {
            title: "Flagged Colleges",
      value: summary.totalReports,
      desc: "Flagged colleges for review",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600 border-red-100",
    },
  ];

  const approvalRate = summary.totalColleges
    ? ((summary.activeColleges / summary.totalColleges) * 100).toFixed(1)
    : "0";
  const pendingRate = summary.totalColleges
    ? ((summary.pendingVerifications / summary.totalColleges) * 100).toFixed(1)
    : "0";
  const enquiriesPerCollege = summary.activeColleges
    ? (summary.totalEnquiries / summary.activeColleges).toFixed(1)
    : "0";
  const applicationsPerCollege = summary.activeColleges
    ? (summary.totalApplications / summary.activeColleges).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-accent" /> Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Overview of colleges, students, applications, and engagement across ILMIKA.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Registered Users",
            value: summary.totalUsers,
            desc: "Students, Advisors & Admins",
            icon: Users,
            color: "bg-blue-50 text-blue-600 border-blue-100",
            link: "/admin/users",
          },
          {
            title: "Total Colleges",
            value: summary.totalColleges,
            desc: "All colleges in the platform",
            icon: GraduationCap,
            color: "bg-purple-50 text-purple-600 border-purple-100",
            link: "/admin/properties",
          },
          {
            title: "Active Colleges",
            value: summary.activeColleges,
            desc: "Verified & live on platform",
            icon: CheckCircle2,
            color: "bg-green-50 text-green-600 border-green-100",
            link: "/admin/properties",
          },
          {
            title: "Pending Verification",
            value: summary.pendingVerifications,
            desc: "Colleges awaiting approval",
            icon: Clock,
            color: "bg-amber-50 text-amber-600 border-amber-100",
            link: "/admin",
          },
          {
            title: "Applications",
            value: summary.totalApplications,
            desc: "Student applications submitted",
            icon: FileText,
            color: "bg-indigo-50 text-indigo-600 border-indigo-100",
            link: "/admin/inquiries",
          },
          {
            title: "Enquiries",
            value: summary.totalEnquiries,
            desc: "College enquiries received",
            icon: MessageSquare,
            color: "bg-teal-50 text-teal-600 border-teal-100",
            link: "/admin/inquiries",
          },
          {
                  title: "Flagged Colleges",
            value: summary.totalReports,
            desc: "Flagged colleges for review",
            icon: AlertTriangle,
            color: "bg-red-50 text-red-600 border-red-100",
            link: "/admin/reports",
          },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <Link
              key={idx}
              href={c.link}
              className="bg-white border border-line rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-accent hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold group-hover:text-accent transition-colors">{c.title}</p>
                <p className="font-mono text-xl font-bold text-primary">{c.value.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{c.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Status Breakdown */}
        <div className="bg-white border border-line rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary">College Status Breakdown</h3>
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Active Colleges</span>
                <span className="font-mono">{summary.activeColleges} ({approvalRate}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: `${approvalRate}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Pending Verification</span>
                <span className="font-mono">{summary.pendingVerifications} ({pendingRate}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pendingRate}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Flagged / Reported</span>
                <span className="font-mono">{summary.totalReports}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${summary.totalColleges ? Math.min((summary.totalReports / summary.totalColleges) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="bg-white border border-line rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary">Engagement Overview</h3>
          <div className="space-y-3.5 text-xs font-semibold text-slate-600">
            <div className="flex justify-between py-1 border-b border-line">
              <span>Enquiries per Active College</span>
              <span className="font-mono text-primary">{enquiriesPerCollege}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line">
              <span>Applications per Active College</span>
              <span className="font-mono text-primary">{applicationsPerCollege}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line">
              <span>College Approval Rate</span>
              <span className="font-mono text-primary">{approvalRate}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Report Rate (Flagged / Active)</span>
              <span className="font-mono text-primary">
                {summary.activeColleges
                  ? ((summary.totalReports / summary.activeColleges) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
