"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Check, X, Eye, AlertCircle, Send,
  GraduationCap, Users, FileText, MessageSquare,
  Clock, TrendingUp, RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface College {
  id: string;
  name: string;
  collegeType: string;
  status: string;
  createdAt: string;
  city: { name: string };
  country: { name: string; flag?: string | null };
  images: Array<{ url: string }>;
}

interface QuickStats {
  totalColleges: number;
  totalUsers: number;
  totalApplications: number;
  totalEnquiries: number;
  pendingVerifications: number;
  activeColleges: number;
}

export default function AdminVerificationQueue() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [verifyRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/verify"),
        fetch("/api/admin/analytics"),
      ]);
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        setColleges(data.colleges || []);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setStats(data.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleVerify = async (collegeId: string, status: "ACTIVE" | "REJECTED", reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, status, rejectionReason: reason || null }),
      });
      if (res.ok) {
        setColleges(prev => prev.filter(c => c.id !== collegeId));
        setRejectingId(null);
        setRejectionReason("");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update college status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = stats ? [
    { label: "Total Colleges", value: stats.totalColleges, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", link: "/admin/properties" },
    { label: "Active Colleges", value: stats.activeColleges, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", link: "/admin/properties" },
    { label: "Pending Review", value: stats.pendingVerifications, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", link: "/admin" },
    { label: "Registered Users", value: stats.totalUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", link: "/admin/users" },
    { label: "Applications", value: stats.totalApplications, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", link: "/admin/inquiries" },
    { label: "Enquiries", value: stats.totalEnquiries, icon: MessageSquare, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", link: "/admin/inquiries" },
  ] : [];

  return (
    <div className="space-y-5 text-left relative">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent" /> Verification Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review and approve or decline new college listings before they go live on Ink EduVerse.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="shrink-0 text-xs font-semibold text-primary bg-white border border-line px-3 py-1.5 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Verification Queue Section */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12 justify-center">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-mono">Loading verification queue...</p>
          </div>
        ) : colleges.length === 0 ? (
          <div className="border border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-serif text-base text-primary font-semibold">All Clear!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              No colleges are pending verification right now. All submitted listings have been processed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {colleges.map((c) => {
              const coverUrl = c.images?.length > 0
                ? c.images[0].url
                : "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80";

              const dateStr = new Date(c.createdAt).toLocaleDateString("en-IN", {
                year: "numeric", month: "short", day: "numeric",
              });

              return (
                <div key={c.id} className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden shadow-xs flex gap-0 hover:shadow-sm transition">
                  {/* Image */}
                  <div className="w-28 shrink-0 relative overflow-hidden">
                    <img src={coverUrl} alt={c.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                    <span className="absolute bottom-2 left-2 bg-accent text-primary text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      {c.collegeType}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between gap-3 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm font-semibold text-primary leading-snug">{c.name}</h3>
                        <span className="shrink-0 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">PENDING</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.city.name}, {c.country.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Submitted: {dateStr}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleVerify(c.id, "ACTIVE")}
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(c.id)}
                        disabled={actionLoading}
                        className="border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" /> Decline
                      </button>
                      <Link
                        href={`/colleges/${c.id}`}
                        target="_blank"
                        className="border border-line hover:bg-secondary text-slate-500 text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setRejectingId(null)} />
          <div className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-primary">Decline College Listing</h4>
                <p className="text-[10px] text-slate-400">Feedback will be sent to the college administrator.</p>
              </div>
            </div>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Accreditation documents missing or invalid address details."
              className="w-full border border-line rounded-xl px-3 py-2.5 bg-secondary text-xs text-slate-700 leading-relaxed focus:outline-none focus:border-accent/50 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 border border-line rounded-xl hover:bg-secondary text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectingId, "REJECTED", rejectionReason)}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
