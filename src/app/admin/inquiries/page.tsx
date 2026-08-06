"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Search,
  GraduationCap,
  FileText,
  CalendarDays,
  BookOpen,
  Trash2,
  X,
  Check,
  PhoneCall,
  Clock,
  Building,
} from "lucide-react";
import Link from "next/link";

interface CollegeEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  createdAt: string;
  college: { id: string; name: string; slug: string };
  student?: { id: string; name: string; email: string };
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  createdAt: string;
  college: { id: string; name: string; slug: string };
  course?: { id: string; name: string };
  student?: { id: string; name: string; email: string };
}

interface CounsellingSession {
  id: string;
  date: string;
  timeSlot: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  college: { id: string; name: string; slug: string };
  student?: { id: string; name: string; email: string };
}

type TabType = "ALL" | "ENQUIRY" | "APPLICATION" | "COUNSELLING";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-amber-50 text-amber-700 border-amber-200",
  CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminInquiriesPage() {
  const [activeFilter, setActiveFilter] = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [enquiries, setEnquiries] = useState<CollegeEnquiry[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [counsellingSessions, setCounsellingSessions] = useState<CounsellingSession[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
        setApplications(data.applications || []);
        setCounsellingSessions(data.counsellingSessions || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (target: string, id: string, status: string) => {
    setActionLoading(id);
    // Optimistic removal for final statuses (ACCEPTED, REJECTED, RESOLVED, COMPLETED, CANCELLED)
    const isFinal = ["ACCEPTED", "REJECTED", "RESOLVED", "COMPLETED", "CANCELLED"].includes(status);

    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, id, status }),
      });
      if (res.ok) {
        if (target === "enquiry") {
          setEnquiries(prev => isFinal ? prev.filter(e => e.id !== id) : prev.map(e => e.id === id ? { ...e, status } : e));
        }
        if (target === "application") {
          setApplications(prev => isFinal ? prev.filter(a => a.id !== id) : prev.map(a => a.id === id ? { ...a, status } : a));
        }
        if (target === "counselling") {
          setCounsellingSessions(prev => isFinal ? prev.filter(s => s.id !== id) : prev.map(s => s.id === id ? { ...s, status } : s));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteItem = async (target: string, id: string) => {
    if (!confirm("Are you sure you want to permanently delete this request?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/inquiries?target=${target}&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (target === "enquiry") setEnquiries(prev => prev.filter(e => e.id !== id));
        if (target === "application") setApplications(prev => prev.filter(a => a.id !== id));
        if (target === "counselling") setCounsellingSessions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const totalCount = enquiries.length + applications.length + counsellingSessions.length;

  const tabs: { id: TabType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "ALL", label: "All Requests", count: totalCount, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "ENQUIRY", label: "College Enquiries", count: enquiries.length, icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: "APPLICATION", label: "Applications", count: applications.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "COUNSELLING", label: "Counselling Sessions", count: counsellingSessions.length, icon: <CalendarDays className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 text-left relative pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/80 pb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" /> Enquiries &amp; Applications
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review and take action on incoming student enquiries, course applications, and counselling session requests.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start sm:self-auto text-xs font-semibold text-primary bg-white border border-line px-3.5 py-2 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 border border-line rounded-2xl shadow-xs">
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? "bg-primary text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon} {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, email, college..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-secondary text-xs outline-none focus:border-accent font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Loading request queue...</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* COLLEGE ENQUIRIES */}
          {(activeFilter === "ALL" || activeFilter === "ENQUIRY") && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-accent" /> College Enquiries ({enquiries.length})
              </h3>

              {enquiries.filter(e => matchesSearch(`${e.name} ${e.email} ${e.phone} ${e.college?.name}`)).length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-mono">
                  No active college enquiries in queue.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {enquiries
                    .filter(e => matchesSearch(`${e.name} ${e.email} ${e.phone} ${e.college?.name}`))
                    .map(item => (
                      <div key={item.id} className="bg-white border border-blue-200/80 rounded-2xl p-5 shadow-xs space-y-3.5 hover:shadow-sm transition flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                            <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
                              <GraduationCap className="w-3 h-3" /> College Enquiry
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" />
                                {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                              <button
                                onClick={() => deleteItem("enquiry", item.id)}
                                disabled={actionLoading === item.id}
                                className="text-slate-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50 cursor-pointer"
                                title="Delete Enquiry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs space-y-1.5">
                            <p className="font-bold text-primary text-base">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium text-[11px]">
                              <span>✉️ {item.email}</span>
                              {item.phone && (
                                <span className="flex items-center gap-1 text-slate-700">
                                  📞 <a href={`tel:${item.phone}`} className="hover:underline text-accent font-bold">{item.phone}</a>
                                </span>
                              )}
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-line/70 text-slate-700 text-xs leading-relaxed italic">
                              "{item.message}"
                            </div>
                          </div>

                          {item.college && (
                            <div className="bg-secondary p-3 rounded-xl border border-line text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-accent shrink-0" />
                                <p className="font-semibold text-primary truncate max-w-[220px]">{item.college.name}</p>
                              </div>
                              <Link href={`/colleges/${item.college.id}`} target="_blank" className="text-accent text-xs font-bold hover:underline shrink-0">
                                View College ↗
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-600"}`}>
                            {item.status}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.status !== "CONTACTED" && (
                              <button disabled={actionLoading === item.id} onClick={() => updateStatus("enquiry", item.id, "CONTACTED")}
                                className="text-xs bg-accent text-primary font-bold px-3.5 py-1.5 rounded-xl hover:bg-accent-hover transition cursor-pointer disabled:opacity-50 shadow-xs">
                                Mark Contacted
                              </button>
                            )}
                            <button disabled={actionLoading === item.id} onClick={() => updateStatus("enquiry", item.id, "RESOLVED")}
                              className="text-xs bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold px-3.5 py-1.5 rounded-xl border border-line transition cursor-pointer disabled:opacity-50">
                              Close &amp; Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS */}
          {(activeFilter === "ALL" || activeFilter === "APPLICATION") && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5 pt-2">
                <FileText className="w-4 h-4 text-accent" /> Student Applications ({applications.length})
              </h3>

              {applications.filter(a => matchesSearch(`${a.name} ${a.email} ${a.phone} ${a.college?.name} ${a.course?.name}`)).length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-mono">
                  No active student applications in queue.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {applications
                    .filter(a => matchesSearch(`${a.name} ${a.email} ${a.phone} ${a.college?.name} ${a.course?.name}`))
                    .map(item => (
                      <div key={item.id} className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs space-y-3.5 hover:shadow-sm transition flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
                              <FileText className="w-3 h-3" /> Application
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" />
                                {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                              <button
                                onClick={() => deleteItem("application", item.id)}
                                disabled={actionLoading === item.id}
                                className="text-slate-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50 cursor-pointer"
                                title="Delete Application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs space-y-1.5">
                            <p className="font-bold text-primary text-base">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium text-[11px]">
                              <span>✉️ {item.email}</span>
                              {item.phone && (
                                <span className="flex items-center gap-1 text-slate-700">
                                  📞 <a href={`tel:${item.phone}`} className="hover:underline text-accent font-bold">{item.phone}</a>
                                </span>
                              )}
                            </div>
                            {item.message && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-line/70 text-slate-700 text-xs leading-relaxed italic">
                                "{item.message}"
                              </div>
                            )}
                          </div>

                          <div className="bg-secondary p-3 rounded-xl border border-line text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-primary truncate max-w-[220px]">{item.college?.name}</p>
                              <Link href={`/colleges/${item.college?.id}`} target="_blank" className="text-accent text-xs font-bold hover:underline shrink-0">
                                View College ↗
                              </Link>
                            </div>
                            {item.course && <p className="text-slate-500 text-xs font-medium">Applied Course: <span className="font-bold text-slate-700">{item.course.name}</span></p>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-600"}`}>
                            {item.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <button disabled={actionLoading === item.id} onClick={() => updateStatus("application", item.id, "ACCEPTED")}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-xs">
                              <Check className="w-3.5 h-3.5" /> Accept Application
                            </button>
                            <button disabled={actionLoading === item.id} onClick={() => updateStatus("application", item.id, "REJECTED")}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-xs">
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* COUNSELLING SESSIONS */}
          {(activeFilter === "ALL" || activeFilter === "COUNSELLING") && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5 pt-2">
                <CalendarDays className="w-4 h-4 text-accent" /> Counselling Sessions ({counsellingSessions.length})
              </h3>

              {counsellingSessions.filter(s => matchesSearch(`${s.student?.name} ${s.student?.email} ${s.college?.name}`)).length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-mono">
                  No active counselling session requests in queue.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {counsellingSessions
                    .filter(s => matchesSearch(`${s.student?.name} ${s.student?.email} ${s.college?.name}`))
                    .map(item => (
                      <div key={item.id} className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs space-y-3.5 hover:shadow-sm transition flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                            <span className="bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
                              <CalendarDays className="w-3 h-3" /> {item.type === "VIDEO_CALL" ? "Video Call" : item.type === "IN_PERSON" ? "In-Person" : "Phone Call"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" />
                                {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                              <button
                                onClick={() => deleteItem("counselling", item.id)}
                                disabled={actionLoading === item.id}
                                className="text-slate-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50 cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs space-y-1.5">
                            <p className="font-bold text-primary text-base">{item.student?.name}</p>
                            <p className="text-slate-600 font-medium">✉️ {item.student?.email}</p>
                            <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100 text-purple-900 font-medium text-xs">
                              📅 Requested Date: <span className="font-bold">{new Date(item.date).toLocaleDateString("en-IN")}</span> at <span className="font-bold">{item.timeSlot}</span>
                            </div>
                            {item.notes && <p className="text-slate-500 italic text-xs">Note: "{item.notes}"</p>}
                          </div>

                          <div className="bg-secondary p-3 rounded-xl border border-line text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-accent shrink-0" />
                              <p className="font-semibold text-primary truncate max-w-[220px]">{item.college?.name}</p>
                            </div>
                            <Link href={`/colleges/${item.college?.id}`} target="_blank" className="text-accent text-xs font-bold hover:underline shrink-0">
                              View College ↗
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-600"}`}>
                            {item.status}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.status !== "CONFIRMED" && (
                              <button disabled={actionLoading === item.id} onClick={() => updateStatus("counselling", item.id, "CONFIRMED")}
                                className="text-xs bg-accent text-primary font-bold px-3.5 py-1.5 rounded-xl hover:bg-accent-hover transition cursor-pointer disabled:opacity-50 shadow-xs">
                                Confirm Session
                              </button>
                            )}
                            <button disabled={actionLoading === item.id} onClick={() => updateStatus("counselling", item.id, "COMPLETED")}
                              className="text-xs bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold px-3.5 py-1.5 rounded-xl border border-line transition cursor-pointer disabled:opacity-50">
                              Complete &amp; Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {totalCount === 0 && (
            <div className="bg-white border border-line rounded-3xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-primary font-bold">All Requests Clear!</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                All college enquiries, student applications, and counselling sessions have been processed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
