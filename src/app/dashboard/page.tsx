"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, Eye, Mail, CalendarRange, Heart, 
  Clock, Bell, Plus, ChevronRight, User, BookOpen, FileText, MessageSquare, ShieldCheck
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

        if (meData.user.role === "COLLEGE_ADMIN" || meData.user.role === "AGENT" || meData.user.role === "ADMIN") {
          // Fetch admin / college desk stats
          const inqRes = await fetch("/api/admin/inquiries");
          if (inqRes.ok) {
            const data = await inqRes.json();
            setStats({
              applicationsCount: data.applications?.length || 0,
              enquiriesCount: data.enquiries?.length || 0,
              sessionsCount: data.counsellingSessions?.length || 0,
            });
          }
        } else {
          // Student stats - fetch real counts from APIs
          try {
            const [enqRes, visitsRes] = await Promise.all([
              fetch("/api/dashboard/enquiries"),
              fetch("/api/dashboard/visits"),
            ]);

            let appsCount = 0;
            let sessionsCount = 0;

            if (enqRes.ok) {
              const enqData = await enqRes.json();
              appsCount = enqData.enquiries?.length || 0;
            }

            if (visitsRes.ok) {
              const visitsData = await visitsRes.json();
              sessionsCount = visitsData.visits?.length || visitsData.sessions?.length || 0;
            }

            setStats({
              shortlistCount: 0,
              applicationsCount: appsCount,
              sessionsCount: sessionsCount,
            });
          } catch (e) {
            setStats({
              shortlistCount: 0,
              applicationsCount: 0,
              sessionsCount: 0,
            });
          }
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
        <p className="text-xs text-slate-500 font-mono">Loading dashboard overview...</p>
      </div>
    );
  }

  if (!user) return null;

  const isCollegeAdmin = user.role === "COLLEGE_ADMIN" || user.role === "AGENT" || user.role === "ADMIN";

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-secondary/40 border border-line rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">
            Welcome back, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isCollegeAdmin
              ? "College Admin Desk · Overview of received student applications, enquiries, and admissions activity."
              : "Student Dashboard · Overview of your saved colleges, submitted applications, and counselling sessions."}
          </p>
        </div>

        {isCollegeAdmin && (
          <Link
            href="/colleges/add"
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add College Listing
          </Link>
        )}
      </div>

      {/* Email Verification Notice */}
      {!user.isEmailVerified && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Verify your email address</p>
            <p className="text-amber-700/80 mt-0.5">Please check your inbox to verify your email. Unverified profiles have restricted privileges.</p>
          </div>
        </div>
      )}

      {/* College Admin Dashboard View */}
      {isCollegeAdmin ? (
        <>
          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link href="/dashboard/enquiries" className="group bg-secondary border border-line hover:border-accent rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer">
              <div className="flex items-start justify-between">
                <FileText className="w-8 h-8 text-accent mb-3" />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors mt-1" />
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{stats?.applicationsCount || 0}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Student Applications</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Submitted for admission</p>
            </Link>

            <Link href="/dashboard/enquiries" className="group bg-secondary border border-line hover:border-accent rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer">
              <div className="flex items-start justify-between">
                <MessageSquare className="w-8 h-8 text-accent mb-3" />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors mt-1" />
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{stats?.enquiriesCount || 0}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">College Enquiries</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Received from prospective students</p>
            </Link>

            <Link href="/dashboard/visits" className="group bg-secondary border border-line hover:border-accent rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer">
              <div className="flex items-start justify-between">
                <CalendarRange className="w-8 h-8 text-accent mb-3" />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors mt-1" />
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{stats?.sessionsCount || 0}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Counselling Sessions</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Booked with your desk</p>
            </Link>
          </div>

          {/* College Admin Shortcuts */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-primary">Admissions Management Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/enquiries"
                className="flex items-center justify-between border border-line hover:border-accent p-4.5 rounded-2xl transition bg-white group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">Manage Applications &amp; Enquiries</span>
                    <p className="text-[11px] text-slate-400">Review, accept, or respond to student requests</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent" />
              </Link>

              <Link
                href="/colleges/add"
                className="flex items-center justify-between border border-line hover:border-accent p-4.5 rounded-2xl transition bg-white group"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">Add &amp; Update College Listings</span>
                    <p className="text-[11px] text-slate-400">Update courses, fee structures, and campus details</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent" />
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* Student Dashboard View */
        <>
          {/* Student Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link href="/dashboard/saved" className="group bg-secondary border border-line hover:border-accent rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer">
              <div className="flex items-start justify-between">
                <Heart className="w-8 h-8 text-accent mb-3" />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors mt-1" />
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{stats?.shortlistCount || 0}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Shortlisted Colleges</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Saved for comparison</p>
            </Link>

            <Link href="/dashboard/enquiries" className="group bg-secondary border border-line hover:border-accent rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer">
              <div className="flex items-start justify-between">
                <Mail className="w-8 h-8 text-accent mb-3" />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors mt-1" />
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{stats?.applicationsCount || 0}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Submitted Applications</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Track your college applications</p>
            </Link>

            <Link href="/dashboard/visits" className="group bg-secondary border border-line hover:border-accent rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer">
              <div className="flex items-start justify-between">
                <CalendarRange className="w-8 h-8 text-accent mb-3" />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors mt-1" />
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{stats?.sessionsCount || 0}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Counselling Sessions</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Upcoming advisor appointments</p>
            </Link>
          </div>

          {/* Student Quick Shortcuts */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-primary">Explore ILMIKA</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/colleges"
                className="flex items-center justify-between border border-line hover:border-accent p-4.5 rounded-2xl transition bg-white group"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">Search &amp; Compare Colleges</span>
                    <p className="text-[11px] text-slate-400">Filter by 195+ countries, fees, and degrees</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent" />
              </Link>

              <Link
                href="/scholarships"
                className="flex items-center justify-between border border-line hover:border-accent p-4.5 rounded-2xl transition bg-white group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">Explore Global Scholarships</span>
                    <p className="text-[11px] text-slate-400">Merit &amp; need-based university tuition waivers</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent" />
              </Link>
            </div>
          </div>
        </>
      )}
      
    </div>
  );
}
