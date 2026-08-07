"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Eye,
  EyeOff,
  Plus,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Stethoscope,
  Briefcase,
  Scale,
  TrendingUp,
  FlaskConical,
  Palette,
  Laptop,
  Pill,
  Sprout,
  Hotel,
  Trash2,
  RotateCcw,
  Archive,
  Filter,
  X,
} from "lucide-react";

interface StreamConfig {
  id: string;
  name: string;
  streamParam: string;
  degreeType: string;
  iconName: string;
  description: string;
  isVisible: boolean;
  isFeaturedHome: boolean;
  isDeleted?: boolean;
  branchesCount: number;
  branches: string[];
}

const ICON_MAP: Record<string, any> = {
  Cpu,
  Stethoscope,
  Briefcase,
  Scale,
  BookOpen,
  TrendingUp,
  FlaskConical,
  Palette,
  Laptop,
  Pill,
  Sprout,
  Hotel,
};

export default function AdminCourseManagementPage() {
  const [streams, setStreams] = useState<StreamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | "VISIBLE" | "HIDDEN">("ALL");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New Stream Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStreamName, setNewStreamName] = useState("");
  const [newStreamDesc, setNewStreamDesc] = useState("");
  const [newDegreeType, setNewDegreeType] = useState("UNDERGRADUATE");
  const [newBranchesText, setNewBranchesText] = useState("");

  // Inline Branch Creation State
  const [addingBranchStreamId, setAddingBranchStreamId] = useState<string | null>(null);
  const [newBranchInput, setNewBranchInput] = useState("");

  const showToastNotice = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddBranch = async (streamId: string) => {
    if (!newBranchInput.trim()) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: streamId,
          action: "addBranch",
          branchName: newBranchInput.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreams((prev) =>
          prev.map((s) => (s.id === streamId ? data.stream : s))
        );
        showToastNotice(`✓ Branch "${newBranchInput.trim()}" added successfully.`);
        setAddingBranchStreamId(null);
        setNewBranchInput("");
      } else {
        showToastNotice("Failed to add branch.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error adding branch.", "error");
    }
  };

  const handleDeleteBranch = async (streamId: string, branchName: string) => {
    if (!confirm(`Delete branch "${branchName}" from this stream?`)) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: streamId,
          action: "deleteBranch",
          branchName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreams((prev) =>
          prev.map((s) => (s.id === streamId ? data.stream : s))
        );
        showToastNotice(`✓ Branch "${branchName}" removed.`);
      } else {
        showToastNotice("Failed to remove branch.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error removing branch.", "error");
    }
  };

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setStreams(data.streams || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isVisible: !currentVisible,
        }),
      });

      if (res.ok) {
        setStreams((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isVisible: !currentVisible } : s))
        );
        showToastNotice(
          `✓ Stream visibility set to ${!currentVisible ? "VISIBLE on Homepage & Navbar" : "HIDDEN"}`
        );
      } else {
        showToastNotice("Failed to update stream visibility.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error updating stream configuration.", "error");
    }
  };

  const handleDeleteStream = async (stream: StreamConfig) => {
    if (!confirm(`Are you sure you want to delete "${stream.name}"? You can restore it anytime from Archived / Deleted streams.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses?id=${stream.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStreams((prev) =>
          prev.map((s) => (s.id === stream.id ? { ...s, isDeleted: true, isVisible: false } : s))
        );
        showToastNotice(`✓ Stream "${stream.name}" deleted and moved to archive.`);
      } else {
        showToastNotice("Failed to delete stream.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error deleting stream.", "error");
    }
  };

  const handleRestoreStream = async (stream: StreamConfig) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stream.id,
          action: "restore",
        }),
      });

      if (res.ok) {
        setStreams((prev) =>
          prev.map((s) => (s.id === stream.id ? { ...s, isDeleted: false, isVisible: true } : s))
        );
        showToastNotice(`✓ Stream "${stream.name}" restored successfully.`);
      } else {
        showToastNotice("Failed to restore stream.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error restoring stream.", "error");
    }
  };

  const handlePermanentDeleteStream = async (stream: StreamConfig) => {
    if (!confirm(`PERMANENT DELETE WARNING: Are you sure you want to PERMANENTLY delete "${stream.name}"? This action CANNOT be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses?id=${stream.id}&permanent=true`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStreams((prev) => prev.filter((s) => s.id !== stream.id));
        showToastNotice(`✓ Stream "${stream.name}" permanently deleted.`);
      } else {
        showToastNotice("Failed to permanently delete stream.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error deleting stream.", "error");
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) return;

    try {
      const branchesArr = newBranchesText
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStreamName,
          description: newStreamDesc,
          degreeType: newDegreeType,
          branches: branchesArr,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreams((prev) => [data.stream, ...prev]);
        setShowAddModal(false);
        setNewStreamName("");
        setNewStreamDesc("");
        setNewBranchesText("");
        showToastNotice(`✓ New stream "${newStreamName}" added successfully.`);
      } else {
        showToastNotice("Failed to create stream.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Error creating stream.", "error");
    }
  };

  const activeStreams = useMemo(() => streams.filter((s) => !s.isDeleted), [streams]);
  const archivedStreams = useMemo(() => streams.filter((s) => s.isDeleted), [streams]);

  const filteredActive = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activeStreams.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.streamParam.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.branches.some((b) => b.toLowerCase().includes(q));

      const matchesDegree =
        degreeFilter === "ALL" || s.degreeType.toUpperCase() === degreeFilter.toUpperCase();

      const matchesVisibility =
        visibilityFilter === "ALL" ||
        (visibilityFilter === "VISIBLE" && s.isVisible) ||
        (visibilityFilter === "HIDDEN" && !s.isVisible);

      return matchesSearch && matchesDegree && matchesVisibility;
    });
  }, [activeStreams, search, degreeFilter, visibilityFilter]);

  const filteredArchived = useMemo(() => {
    const q = search.toLowerCase().trim();
    return archivedStreams.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.streamParam.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.branches.some((b) => b.toLowerCase().includes(q));

      const matchesDegree =
        degreeFilter === "ALL" || s.degreeType.toUpperCase() === degreeFilter.toUpperCase();

      return matchesSearch && matchesDegree;
    });
  }, [archivedStreams, search, degreeFilter]);

  const visibleCount = useMemo(() => activeStreams.filter((s) => s.isVisible).length, [activeStreams]);
  const hiddenCount = useMemo(() => activeStreams.filter((s) => !s.isVisible).length, [activeStreams]);
  const totalBranches = useMemo(
    () => activeStreams.reduce((acc, s) => acc + (s.branches?.length || 0), 0),
    [activeStreams]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading course management metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-8 relative">

      {/* Floating Toast Notice */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white transition animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-[#0F172A] border border-[#D4AF37]/50"
              : "bg-red-900 border border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#0F172A] font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" /> Course Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic streams, degree levels, and control which streams are visible across the homepage and navigation mega menu.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] font-bold px-4 py-2 rounded-xl text-xs transition duration-300 shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Stream
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveTab("active");
            setVisibilityFilter("ALL");
          }}
          className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition duration-200 text-left cursor-pointer ${
            activeTab === "active" && visibilityFilter === "ALL"
              ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
              : "border-[#E5E7EB] hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Streams</p>
          <p className="font-serif text-2xl font-bold text-[#0F172A] mt-1">{activeStreams.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Configured disciplines</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("active");
            setVisibilityFilter("VISIBLE");
          }}
          className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition duration-200 text-left cursor-pointer ${
            activeTab === "active" && visibilityFilter === "VISIBLE"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-[#E5E7EB] hover:border-emerald-300"
          }`}
        >
          <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Visible on Home</p>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">{visibleCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active in navbar mega menu</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("active");
            setVisibilityFilter("HIDDEN");
          }}
          className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition duration-200 text-left cursor-pointer ${
            activeTab === "active" && visibilityFilter === "HIDDEN"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-[#E5E7EB] hover:border-amber-300"
          }`}
        >
          <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Hidden / Draft</p>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">{hiddenCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Inactive streams</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("active");
            setVisibilityFilter("ALL");
            setSearch("");
            setDegreeFilter("ALL");
          }}
          className="bg-white border border-[#E5E7EB] hover:border-[#D4AF37] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition duration-200 text-left cursor-pointer"
        >
          <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Branches</p>
          <p className="font-serif text-2xl font-bold text-[#D4AF37] mt-1">{totalBranches}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Specialisations defined</p>
        </button>
      </div>

      {/* Controls Container */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3.5">
        {/* Row 1: Status Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "active"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Total Streams</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "active" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
              }`}>
                {activeStreams.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("archived")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "archived"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Deleted / Archived</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "archived" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
              }`}>
                {archivedStreams.length}
              </span>
            </button>
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search streams or specialisation branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100"></div>

        {/* Row 2: Degree Level Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#D4AF37]" /> Degree Level:
          </span>
          {[
            { id: "ALL", label: "All Degrees" },
            { id: "UNDERGRADUATE", label: "Undergraduate (UG)" },
            { id: "POSTGRADUATE", label: "Postgraduate (PG)" },
            { id: "PHD", label: "PhD / Doctorate" },
            { id: "DIPLOMA", label: "Diploma" },
            { id: "ONLINE", label: "Online & Distance" },
          ].map((deg) => (
            <button
              key={deg.id}
              onClick={() => setDegreeFilter(deg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                degreeFilter === deg.id
                  ? "bg-[#D4AF37] text-[#0F172A] shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {deg.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. ACTIVE STREAMS GRID */}
      {activeTab === "active" && (
        filteredActive.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded-2xl p-12 text-center bg-white shadow-2xs">
            <p className="text-xs text-slate-500 leading-relaxed font-mono">
              No active academic streams match your search or degree filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActive.map((st) => {
              const IconComp = ICON_MAP[st.iconName] || BookOpen;

              return (
                <div
                  key={st.id}
                  className={`bg-white border rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
                    st.isVisible ? "border-[#E5E7EB]" : "border-slate-200/60 bg-slate-50/40 opacity-80"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Stream Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4AF37] border border-amber-200/60 grid place-items-center shrink-0">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-sm font-bold text-[#0F172A] leading-tight">
                            {st.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400 font-medium uppercase">
                            {st.degreeType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {st.description}
                    </p>

                    {/* Branches List Badges */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Specialisations / Branches</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#D4AF37] font-mono font-bold">{st.branches.length} Branches</span>
                          <button
                            onClick={() => {
                              setAddingBranchStreamId(st.id);
                              setNewBranchInput("");
                            }}
                            className="text-[10px] font-bold bg-amber-50 text-[#D4AF37] hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            title="Add new branch/specialisation to this stream"
                          >
                            <Plus className="w-3 h-3" /> Add Branch
                          </button>
                        </div>
                      </div>

                      {addingBranchStreamId === st.id && (
                        <div className="flex items-center gap-1.5 mb-2.5 animate-in fade-in duration-150">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Type new branch name..."
                            value={newBranchInput}
                            onChange={(e) => setNewBranchInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddBranch(st.id);
                              if (e.key === "Escape") setAddingBranchStreamId(null);
                            }}
                            className="flex-1 bg-slate-50 border border-[#D4AF37] rounded-lg px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          />
                          <button
                            onClick={() => handleAddBranch(st.id)}
                            className="bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setAddingBranchStreamId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                        {st.branches.map((br, bIdx) => (
                          <span
                            key={bIdx}
                            className="group/badge bg-slate-100 text-slate-700 border border-slate-200/70 text-[10px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-slate-200/60 transition"
                          >
                            <span>{br}</span>
                            <button
                              onClick={() => handleDeleteBranch(st.id, br)}
                              className="opacity-0 group-hover/badge:opacity-100 p-0.5 hover:text-red-600 transition cursor-pointer"
                              title="Delete branch"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Control Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleVisibility(st.id, st.isVisible)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        st.isVisible
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {st.isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteStream(st)}
                      className="p-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Delete Stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* 2. ARCHIVED / DELETED STREAMS GRID */}
      {activeTab === "archived" && (
        filteredArchived.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded-2xl p-12 text-center bg-white shadow-2xs">
            <p className="text-xs text-slate-500 leading-relaxed font-mono">
              No deleted/archived streams found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArchived.map((st) => {
              const IconComp = ICON_MAP[st.iconName] || BookOpen;

              return (
                <div
                  key={st.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between opacity-80"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 border border-slate-300 grid place-items-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-slate-700 leading-tight">
                          {st.name}
                        </h3>
                        <span className="text-[10px] font-mono text-red-600 font-bold uppercase">
                          DELETED / ARCHIVED
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {st.description}
                    </p>

                    <div className="pt-1">
                      <p className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
                        Branches ({st.branches.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                        {st.branches.map((br, bIdx) => (
                          <span
                            key={bIdx}
                            className="bg-slate-200/70 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-lg"
                          >
                            {br}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePermanentDeleteStream(st)}
                      className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      title="Permanently Delete Stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </button>

                    <button
                      onClick={() => handleRestoreStream(st)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Stream</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Add New Stream Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" /> Add Academic Stream
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stream Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  value={newStreamName}
                  onChange={(e) => setNewStreamName(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree Level</label>
                <select
                  value={newDegreeType}
                  onChange={(e) => setNewDegreeType(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-semibold focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="POSTGRADUATE">Postgraduate</option>
                  <option value="PHD">PhD / Doctorate</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="ONLINE">Online / Distance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of subjects and focus areas..."
                  value={newStreamDesc}
                  onChange={(e) => setNewStreamDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specialisation Branches (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, NLP, Autonomous Systems, Computer Vision"
                  value={newBranchesText}
                  onChange={(e) => setNewBranchesText(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] text-xs font-bold rounded-xl transition duration-300 cursor-pointer shadow-xs"
                >
                  Save Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
