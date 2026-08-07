"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Trash2, RotateCcw, Star, Plus, Archive, Search, CheckCircle2, AlertCircle, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface College {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerId: string;
  city?: { name: string };
  country?: { name: string; flagEmoji?: string };
  isFeatured: boolean;
  isVerified: boolean;
  images: Array<{ url: string }>;
}

export default function AdminListedColleges() {
  const [activeColleges, setActiveColleges] = useState<College[]>([]);
  const [archivedColleges, setArchivedColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties");
      if (res.ok) {
        const data = await res.json();
        const activeList = data.active || data.colleges || [];
        const archivedList = data.archived || [];
        setActiveColleges(activeList);
        setArchivedColleges(archivedList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: id,
          action: "toggleFeatured",
        }),
      });

      if (res.ok) {
        setActiveColleges(prev => prev.map(c => c.id === id ? { ...c, isFeatured: !c.isFeatured } : c));
        showToast("College featured status updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollege = async (college: College) => {
    if (!confirm(`Are you sure you want to delete "${college.name}"? It will be moved to Archived / Deleted list where you can restore it anytime.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/properties?collegeId=${college.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const deletedCollege = { ...college, status: "ARCHIVED" };
        setActiveColleges(prev => prev.filter(c => c.id !== college.id));
        setArchivedColleges(prev => [deletedCollege, ...prev]);
        showToast(`✓ College "${college.name}" deleted and moved to archive.`);
      } else {
        showToast("Failed to delete college.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting college.", "error");
    }
  };

  const handleRestoreCollege = async (college: College) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: college.id,
          action: "restore",
        }),
      });

      if (res.ok) {
        const restoredCollege = { ...college, status: "ACTIVE" };
        setArchivedColleges(prev => prev.filter(c => c.id !== college.id));
        setActiveColleges(prev => [restoredCollege, ...prev]);
        showToast(`✓ College "${college.name}" restored successfully.`);
      } else {
        showToast("Failed to restore college.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error restoring college.", "error");
    }
  };

  const handlePermanentDeleteCollege = async (college: College) => {
    if (!confirm(`PERMANENT DELETE WARNING: Are you sure you want to PERMANENTLY delete "${college.name}"? This will delete the college from the database forever!`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/properties?collegeId=${college.id}&permanent=true`, {
        method: "DELETE",
      });

      if (res.ok) {
        setArchivedColleges(prev => prev.filter(c => c.id !== college.id));
        showToast(`✓ College "${college.name}" permanently deleted.`);
      } else {
        showToast("Failed to permanently delete college.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting college.", "error");
    }
  };

  const filteredActive = activeColleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.country?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredArchived = archivedColleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.country?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading listed colleges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left relative pb-8">

      {/* Toast Notice */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white transition animate-in fade-in duration-200 ${
          toast.type === "success" ? "bg-slate-900 border border-accent/50" : "bg-red-900 border border-red-500"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-accent" /> Listed Colleges
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage, verify, feature, or soft delete/restore active university listings worldwide.</p>
          </div>
          <Link
            href="/colleges/add"
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-primary font-bold px-4 py-2 rounded-xl text-xs transition duration-150 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New College
          </Link>
        </div>

        {/* Tab Controls & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-line shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "active"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-secondary/60 text-slate-600 hover:bg-secondary"
              }`}
            >
              <span>Active Listings</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "active" ? "bg-accent text-primary" : "bg-slate-200 text-slate-700"
              }`}>
                {activeColleges.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("archived")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === "archived"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-secondary/60 text-slate-600 hover:bg-secondary"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Deleted / Archived</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "archived" ? "bg-accent text-primary" : "bg-slate-200 text-slate-700"
              }`}>
                {archivedColleges.length}
              </span>
            </button>
          </div>

          {/* Instant Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search colleges by name, city, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-line rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-accent text-primary transition"
            />
          </div>
        </div>

        {/* 1. ACTIVE LISTINGS TABLE */}
        {activeTab === "active" && (
          filteredActive.length === 0 ? (
            <div className="border border-line rounded-2xl p-12 text-center bg-white shadow-xs">
              <p className="text-xs text-slate-500 leading-relaxed font-mono">No active listed colleges match your filter criteria.</p>
            </div>
          ) : (
            <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-line text-slate-700 text-xs tracking-wide">
                    <tr>
                      <th className="px-6 py-4 font-bold">Image</th>
                      <th className="px-6 py-4 font-bold">College Name</th>
                      <th className="px-6 py-4 font-bold">Location</th>
                      <th className="px-6 py-4 font-bold text-center">Status</th>
                      <th className="px-6 py-4 font-bold text-center">Featured</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredActive.map((col) => {
                      const coverUrl = col.images && col.images.length > 0
                        ? col.images[0].url
                        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80";

                      return (
                        <tr key={col.id} className="hover:bg-secondary/15 transition-colors">
                          <td className="px-6 py-4">
                            <img src={coverUrl} alt={col.name} className="w-12 h-10 object-cover rounded-lg border border-line" />
                          </td>
                          <td className="px-6 py-4 font-semibold text-primary max-w-xs truncate">
                            <Link href={`/colleges/${col.id}`} className="hover:underline hover:text-accent">
                              {col.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {col.city?.name || "Global"}, {col.country?.name || ""}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide capitalize ${
                              col.status === "ACTIVE" 
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                                : "bg-amber-50 border border-amber-200 text-amber-700"
                            }`}>
                              {col.status.toLowerCase().replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(col.id)}
                              title={col.isFeatured ? "Unfeature College" : "Feature College"}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                col.isFeatured 
                                  ? "text-amber-500 hover:text-amber-600 bg-amber-500/10" 
                                  : "text-slate-300 hover:text-slate-500 hover:bg-secondary"
                              }`}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/colleges/${col.id}`}
                                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                              >
                                <span>View Page</span>
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => handleDeleteCollege(col)}
                                className="p-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                title="Delete College"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* 2. DELETED / ARCHIVED LISTINGS TABLE */}
        {activeTab === "archived" && (
          filteredArchived.length === 0 ? (
            <div className="border border-line rounded-2xl p-12 text-center bg-white shadow-xs">
              <p className="text-xs text-slate-500 leading-relaxed font-mono">No deleted/archived colleges found.</p>
            </div>
          ) : (
            <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-line text-slate-700 text-xs tracking-wide">
                    <tr>
                      <th className="px-6 py-4 font-bold">Image</th>
                      <th className="px-6 py-4 font-bold">College Name</th>
                      <th className="px-6 py-4 font-bold">Location</th>
                      <th className="px-6 py-4 font-bold text-center">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Restore Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredArchived.map((col) => {
                      const coverUrl = col.images && col.images.length > 0
                        ? col.images[0].url
                        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80";

                      return (
                        <tr key={col.id} className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
                          <td className="px-6 py-4">
                            <img src={coverUrl} alt={col.name} className="w-12 h-10 object-cover rounded-lg border border-line grayscale opacity-80" />
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700 max-w-xs truncate">
                            {col.name}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {col.city?.name || "Global"}, {col.country?.name || ""}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-red-50 border border-red-200 text-red-700 uppercase">
                              DELETED / ARCHIVED
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePermanentDeleteCollege(col)}
                              className="border border-red-200 hover:bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg transition text-xs inline-flex items-center gap-1.5 cursor-pointer"
                              title="Permanently Delete College"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Permanently</span>
                            </button>
                            <button
                              onClick={() => handleRestoreCollege(col)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore College</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}
