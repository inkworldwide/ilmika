"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, Plus, Edit3, Trash, Eye, 
  CheckCircle, Clock, AlertTriangle, ShieldCheck, XCircle, MapPin, Award, BookOpen, ExternalLink, X, DollarSign, Sparkles, Archive, RotateCcw, FileText
} from "lucide-react";

interface CourseItem {
  id: string;
  name: string;
  degree: string;
  stream: string;
  durationYears: number;
  annualFees: number;
  feeCurrency: string;
  mode: string;
  eligibility: string;
  entranceExams: string[];
  totalSeats: number | null;
  scholarshipAvailable: boolean;
  isActive: boolean;
}

interface CollegeListing {
  id: string;
  name: string;
  slug: string;
  description: string;
  collegeType: string;
  address: string;
  status: "DRAFT" | "PENDING_VERIFICATION" | "ACTIVE" | "REJECTED" | "ARCHIVED";
  rejectionReason: string | null;
  viewCount: number;
  establishedYear: number | null;
  totalStudents: number | null;
  nirfRanking: number | null;
  qsRanking: number | null;
  createdAt: string;
  city?: { name: string };
  country?: { name: string; flag?: string | null };
  images: Array<{ url: string }>;
  courses?: Array<{ id: string; name: string }>;
}

export default function DashboardMyCollegesPage() {
  const [colleges, setColleges] = useState<CollegeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "ARCHIVED" | "DRAFT">("ALL");

  // Manage Courses Modal state
  const [managingCollege, setManagingCollege] = useState<CollegeListing | null>(null);
  const [collegeCourses, setCollegeCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Course Form state
  const [newCourse, setNewCourse] = useState({
    name: "",
    degree: "BACHELOR",
    stream: "ENGINEERING",
    durationYears: "4.0",
    annualFees: "",
    feeCurrency: "INR",
    totalSeats: "",
    eligibility: "",
    entranceExams: "",
    scholarshipAvailable: false,
  });

  const fetchMyColleges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/properties");
      if (res.ok) {
        const data = await res.json();
        const list = data.colleges || data.properties || [];
        setColleges(list);
      }
    } catch (err) {
      console.error("Fetch owned colleges error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyColleges();
  }, []);

  const openManageCoursesModal = async (col: CollegeListing) => {
    setManagingCollege(col);
    setShowAddForm(false);
    setCoursesLoading(true);
    try {
      const res = await fetch(`/api/colleges/${col.id}/courses`);
      if (res.ok) {
        const data = await res.json();
        setCollegeCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses for college:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCollege) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/colleges/${managingCollege.id}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCourse,
          durationYears: parseFloat(newCourse.durationYears) || 4.0,
          annualFees: parseFloat(newCourse.annualFees) || 0,
          totalSeats: newCourse.totalSeats ? parseInt(newCourse.totalSeats) : null,
          entranceExams: newCourse.entranceExams.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setNewCourse({
          name: "", degree: "BACHELOR", stream: "ENGINEERING", durationYears: "4.0",
          annualFees: "", feeCurrency: "INR", totalSeats: "", eligibility: "", entranceExams: "", scholarshipAvailable: false,
        });
        openManageCoursesModal(managingCollege);
        fetchMyColleges();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    if (!managingCollege) return;
    try {
      const res = await fetch(`/api/colleges/${managingCollege.id}/courses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, isActive: !currentStatus }),
      });
      if (res.ok) {
        openManageCoursesModal(managingCollege);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!managingCollege || !confirm("Are you sure you want to remove this course offering?")) return;
    try {
      const res = await fetch(`/api/colleges/${managingCollege.id}/courses?courseId=${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        openManageCoursesModal(managingCollege);
        fetchMyColleges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestVerification = async (collegeId: string) => {
    try {
      const res = await fetch(`/api/admin/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, status: "PENDING_VERIFICATION" }),
      });
      if (res.ok) {
        fetchMyColleges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveCollege = async (collegeId: string) => {
    if (!confirm("Are you sure you want to archive this college listing? It will be hidden from public searches and moved to your Archived tab.")) return;
    try {
      const res = await fetch(`/api/admin/properties`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, action: "archive" }),
      });
      if (res.ok) {
        setColleges(prev => prev.map(c => c.id === collegeId ? { ...c, status: "ARCHIVED" } : c));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to archive college");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreCollege = async (collegeId: string) => {
    try {
      const res = await fetch(`/api/admin/properties`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, action: "restore" }),
      });
      if (res.ok) {
        setColleges(prev => prev.map(c => c.id === collegeId ? { ...c, status: "ACTIVE" } : c));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to restore college");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDeleteCollege = async (collegeId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this college? This action cannot be undone and will remove all associated data.")) return;
    try {
      const res = await fetch(`/api/admin/properties?collegeId=${collegeId}&permanent=true`, { method: "DELETE" });
      if (res.ok) {
        setColleges(prev => prev.filter(c => c.id !== collegeId));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to permanently delete college");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading your college listings...</p>
      </div>
    );
  }

  const STATUS_BADGES: Record<string, { label: string; bg: string }> = {
    ACTIVE: { label: "Active", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PENDING_VERIFICATION: { label: "Pending Verification", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    DRAFT: { label: "Draft", bg: "bg-slate-100 text-slate-600 border-slate-200" },
    REJECTED: { label: "Needs Revision", bg: "bg-red-50 text-red-700 border-red-200" },
    ARCHIVED: { label: "Archived", bg: "bg-gray-100 text-gray-500 border-gray-200" },
  };

  const filteredColleges = colleges.filter((c) => {
    if (statusFilter === "ACTIVE") return c.status === "ACTIVE";
    if (statusFilter === "ARCHIVED") return c.status === "ARCHIVED";
    if (statusFilter === "DRAFT") return c.status === "DRAFT" || c.status === "PENDING_VERIFICATION" || c.status === "REJECTED";
    return true;
  });

  return (
    <div className="space-y-6 text-left relative font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-accent" /> My Listed Colleges ({colleges.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage your published institutions, admission status, and course details.</p>
        </div>
        <Link
          href="/colleges/add"
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add College Listing
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          { id: "ALL", label: `All Listings (${colleges.length})` },
          { id: "ACTIVE", label: `Active (${colleges.filter(c => c.status === "ACTIVE").length})` },
          { id: "ARCHIVED", label: `Archived (${colleges.filter(c => c.status === "ARCHIVED").length})` },
          { id: "DRAFT", label: `Drafts & Pending (${colleges.filter(c => c.status === "DRAFT" || c.status === "PENDING_VERIFICATION" || c.status === "REJECTED").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`pb-2.5 transition whitespace-nowrap border-b-2 cursor-pointer font-bold ${
              statusFilter === tab.id
                ? "text-[#0F172A] border-[#D4AF37]"
                : "text-slate-400 border-transparent hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredColleges.length === 0 ? (
        <div className="border border-line rounded-3xl p-12 text-center max-w-md mx-auto my-8 bg-slate-50/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-primary font-bold">No Colleges Found</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {statusFilter === "ARCHIVED"
                ? "You have no archived colleges."
                : "No college listings matched the selected filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredColleges.map((col) => {
            const statusConfig = STATUS_BADGES[col.status] || STATUS_BADGES["DRAFT"];
            const coverUrl = col.images && col.images.length > 0
              ? col.images[0].url
              : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80";

            return (
              <div key={col.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition space-y-4 flex flex-col md:flex-row gap-5 items-stretch">
                {/* Cover Image */}
                <div className="w-full md:w-48 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                  <img src={coverUrl} alt={col.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-[#0F172A] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                    {col.collegeType}
                  </span>
                </div>

                {/* College Info */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                          <Link href={`/colleges/${col.id}`} className="hover:text-accent transition flex items-center gap-1.5">
                            {col.name}
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{col.city?.name || col.address}, {col.country?.flag} {col.country?.name}</span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusConfig.bg}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                      {col.nirfRanking && (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-md font-bold">
                          NIRF #{col.nirfRanking}
                        </span>
                      )}
                      {col.qsRanking && (
                        <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-md font-bold">
                          QS #{col.qsRanking}
                        </span>
                      )}
                      {col.totalStudents && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                          👥 {col.totalStudents.toLocaleString()} Students
                        </span>
                      )}
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-primary">
                        📚 {col.courses?.length || 0} Active Courses
                      </span>
                      <span className="text-slate-400">
                        👁 {col.viewCount} views
                      </span>
                    </div>
                  </div>

                  {/* Rejection Warning */}
                  {col.status === "REJECTED" && col.rejectionReason && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Verification Note:</p>
                        <p className="text-red-700 mt-0.5">{col.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Archived Banner Notice */}
                  {col.status === "ARCHIVED" && (
                    <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-600 flex items-center gap-2 font-medium">
                      <Archive className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>This college is currently archived and hidden from public search results.</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/colleges/${col.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-primary font-bold text-xs px-3.5 py-1.5 rounded-xl transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Public Page
                      </Link>

                      <button
                        onClick={() => openManageCoursesModal(col)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs px-3.5 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-accent" /> Manage Courses
                      </button>

                      {(col.status === "DRAFT" || col.status === "REJECTED") && (
                        <button
                          onClick={() => handleRequestVerification(col.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Submit for Verification
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {col.status === "ARCHIVED" ? (
                        <>
                          <button
                            onClick={() => handleRestoreCollege(col.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-bold inline-flex items-center gap-1.5"
                            title="Restore to Active"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore Listing
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteCollege(col.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-bold inline-flex items-center gap-1.5"
                            title="Delete Permanently"
                          >
                            <Trash className="w-3.5 h-3.5" /> Permanently Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleArchiveCollege(col.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer text-xs font-bold inline-flex items-center gap-1"
                          title="Delete College"
                        >
                          <Trash className="w-3.5 h-3.5 text-red-600" /> Delete
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MANAGE COURSES MODAL ── */}
      {managingCollege && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Course Management Desk
                </span>
                <h3 className="font-serif text-xl font-bold text-primary mt-1">
                  Courses offered by {managingCollege.name}
                </h3>
              </div>
              <button
                onClick={() => setManagingCollege(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Top Actions */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">
                {collegeCourses.length} courses currently configured for this institution.
              </p>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-accent" /> {showAddForm ? "Cancel Adding" : "Add New Course"}
              </button>
            </div>

            {/* INLINE ADD COURSE FORM */}
            {showAddForm && (
              <form onSubmit={handleCreateCourse} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-sm text-primary flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Add New Course Offering
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Course Name *</label>
                    <input
                      type="text" required
                      value={newCourse.name}
                      onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                      placeholder="e.g. B.Tech Computer Science & Engineering"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Degree Level *</label>
                    <select
                      value={newCourse.degree}
                      onChange={e => setNewCourse({ ...newCourse, degree: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    >
                      <option value="BACHELOR">Bachelor's Degree</option>
                      <option value="MASTER">Master's Degree</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="PHD">Doctorate / PhD</option>
                      <option value="CERTIFICATE">Certificate</option>
                      <option value="INTEGRATED">Integrated Programme</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Academic Stream *</label>
                    <select
                      value={newCourse.stream}
                      onChange={e => setNewCourse({ ...newCourse, stream: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    >
                      <option value="ENGINEERING">Engineering & Technology</option>
                      <option value="MANAGEMENT">Management / Business</option>
                      <option value="MEDICAL">Medicine & Health</option>
                      <option value="ARTS">Arts & Humanities</option>
                      <option value="COMMERCE">Commerce & Finance</option>
                      <option value="SCIENCE">Science & Mathematics</option>
                      <option value="LAW">Law & Legal Studies</option>
                      <option value="DESIGN">Design & Architecture</option>
                      <option value="INFORMATION_TECHNOLOGY">IT & Computing</option>
                      <option value="PHARMACY">Pharmacy</option>
                      <option value="OTHER">Other Discipline</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Duration (Years)</label>
                    <input
                      type="number" step="0.5"
                      value={newCourse.durationYears}
                      onChange={e => setNewCourse({ ...newCourse, durationYears: e.target.value })}
                      placeholder="e.g. 4.0 or 2.0"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Annual Fees (INR)</label>
                    <input
                      type="number"
                      value={newCourse.annualFees}
                      onChange={e => setNewCourse({ ...newCourse, annualFees: e.target.value })}
                      placeholder="e.g. 250000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Seats Available</label>
                    <input
                      type="number"
                      value={newCourse.totalSeats}
                      onChange={e => setNewCourse({ ...newCourse, totalSeats: e.target.value })}
                      placeholder="e.g. 120"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Eligibility Requirements *</label>
                  <input
                    type="text" required
                    value={newCourse.eligibility}
                    onChange={e => setNewCourse({ ...newCourse, eligibility: e.target.value })}
                    placeholder="e.g. 10+2 with Physics, Chem, Math (>75% aggregate score)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Accepted Entrance Exams & Cutoffs</label>
                  <input
                    type="text"
                    value={newCourse.entranceExams}
                    onChange={e => setNewCourse({ ...newCourse, entranceExams: e.target.value })}
                    placeholder="e.g. JEE Advanced (AIR 1 - 250), SAT (1450+ score)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Separate multiple exams with commas.</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="scholarshipAvailable"
                    checked={newCourse.scholarshipAvailable}
                    onChange={e => setNewCourse({ ...newCourse, scholarshipAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                  />
                  <label htmlFor="scholarshipAvailable" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Offers Scholarship &amp; Financial Aid for this course
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : "Save Course Offering"}
                  </button>
                </div>
              </form>
            )}

            {/* COURSE LIST */}
            {coursesLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                Loading courses offered by {managingCollege.name}...
              </div>
            ) : collegeCourses.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No courses listed for this college yet.</p>
                <p className="text-[11px] text-slate-400">Click "+ Add New Course" above to add your first degree or diploma offering.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {collegeCourses.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded uppercase">
                            {c.degree} · {c.stream}
                          </span>
                          {!c.isActive && (
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-base font-bold text-primary mt-1">{c.name}</h4>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-accent text-base">
                          {c.feeCurrency === "INR" ? "₹" : c.feeCurrency} {Number(c.annualFees).toLocaleString()}/yr
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.durationYears} Years</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Eligibility:</strong> {c.eligibility}
                    </p>

                    {c.entranceExams && c.entranceExams.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                        <span className="font-bold text-slate-700">Accepted Cutoffs:</span>
                        {c.entranceExams.map((exam, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold">
                            🎯 {exam}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2 text-xs">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {c.totalSeats ? `${c.totalSeats} seats available` : "Open seats"}
                        {c.scholarshipAvailable && " · 🎓 Scholarship Eligible"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCourseStatus(c.id, c.isActive)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            c.isActive
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
