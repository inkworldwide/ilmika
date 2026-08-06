"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Trash2, Edit3, RotateCcw, XCircle, Star, Plus, Archive, Search } from "lucide-react";
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading listed colleges...</p>
      </div>
    );
  }

  const filteredActive = activeColleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.country?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left relative">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-accent" /> Listed Colleges
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage, verify, and feature active university listings worldwide.</p>
          </div>
          <Link
            href="/colleges/add"
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-primary font-bold px-4 py-2 rounded-xl text-xs transition duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New College
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-line shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search colleges by name, city, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-line rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-accent text-primary transition"
            />
          </div>
          <div className="text-xs font-mono font-semibold text-slate-400">
            {filteredActive.length} active colleges
          </div>
        </div>

        {filteredActive.length === 0 ? (
          <div className="border border-line rounded-2xl p-12 text-center bg-secondary/35">
            <p className="text-xs text-slate-500 leading-relaxed">No active listed colleges found.</p>
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
                          <img src={coverUrl} alt={col.name} className="w-12 h-10 object-cover rounded border border-line" />
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide capitalize ${
                            col.status === "ACTIVE" 
                              ? "bg-green-50 border border-green-200 text-green-700" 
                              : "bg-amber-50 border border-amber-200 text-amber-700"
                          }`}>
                            {col.status.toLowerCase().replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(col.id)}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              col.isFeatured 
                                ? "text-amber-500 hover:text-amber-600 bg-amber-500/10" 
                                : "text-slate-300 hover:text-slate-500 hover:bg-secondary"
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/colleges/${col.id}`}
                            className="text-xs font-bold text-accent hover:underline"
                          >
                            View Page →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
