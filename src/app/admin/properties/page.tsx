"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid, Trash2, Edit3, RotateCcw, XCircle, Star, Plus, Archive, Search } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
  ownerId: string;
  owner?: { customId: string | null; name?: string | null; role?: string | null };
  city?: { name: string };
  isFeatured: boolean;
  rejectionReason?: string | null;
  images: Array<{ url: string }>;
}

const getCityCode = (cityName?: string, userId?: string) => {
  if (cityName && cityName.trim().length >= 2) {
    const clean = cityName.trim().toUpperCase();
    if (clean.startsWith("BENGALURU") || clean.startsWith("BANGALORE")) return "BE";
    if (clean.startsWith("KOCHI") || clean.startsWith("COCHIN")) return "KO";
    if (clean.startsWith("MUMBAI") || clean.startsWith("BOMBAY")) return "MU";
    if (clean.startsWith("DELHI")) return "DE";
    if (clean.startsWith("HYDERABAD")) return "HY";
    if (clean.startsWith("CHENNAI")) return "CH";
    if (clean.startsWith("PUNE")) return "PU";
    if (clean.startsWith("KOLKATA")) return "KO";
    if (clean.startsWith("AHMEDABAD")) return "AH";
    if (clean.startsWith("GURUGRAM") || clean.startsWith("GURGAON")) return "GU";
    if (clean.startsWith("NOIDA")) return "NO";
    return clean.substring(0, 2);
  }
  const cityCodes = ["KO", "MU", "BE", "DE", "HY", "CH", "PU", "AH", "GU", "NO"];
  const charSum = (userId || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return cityCodes[charSum % cityCodes.length];
};

const getOwnerDisplayId = (owner?: { customId: string | null } | null, ownerId?: string, cityName?: string) => {
  if (owner?.customId && !owner.customId.startsWith("RE")) {
    return owner.customId;
  }
  const idStr = ownerId || "";
  const cityCode = getCityCode(cityName, idStr);
  const deterministicNum = parseInt(idStr.substring(0, 4), 16) % 9000 + 1000;
  return `${cityCode}${isNaN(deterministicNum) ? "1000" : deterministicNum}`;
};

const getOwnerTooltip = (owner?: { name?: string | null; role?: string | null } | null) => {
  if (!owner || !owner.name) return "Lister Details";
  const cleanName = owner.name.replace(/\s*\([^)]*\)/g, "").trim();
  const roleLabel = owner.role === "AGENT" ? "Agent" : owner.role === "ADMIN" ? "Admin" : owner.role === "OWNER" ? "Owner" : "User";
  return `${roleLabel}: ${cleanName}`;
};

export default function AdminListedProperties() {
  const [activeProperties, setActiveProperties] = useState<Property[]>([]);
  const [archivedProperties, setArchivedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Archiving states
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties");
      if (res.ok) {
        const data = await res.json();
        setActiveProperties(data.active || []);
        setArchivedProperties(data.archived || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleArchive = async () => {
    if (!archivingId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: archivingId,
          action: "archive",
          reason: archiveReason || "Deleted by Administrator",
        }),
      });

      if (res.ok) {
        await fetchProperties();
        setArchivingId(null);
        setArchiveReason("");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to archive property");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "restore",
        }),
      });

      if (res.ok) {
        await fetchProperties();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to restore property");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this property? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "delete",
        }),
      });

      if (res.ok) {
        await fetchProperties();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete property");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "toggleFeatured",
        }),
      });

      if (res.ok) {
        // Optimistic UI update
        const updater = (props: Property[]) =>
          props.map(p => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
        setActiveProperties(updater);
        setArchivedProperties(updater);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading listed properties...</p>
      </div>
    );
  }

  const filteredActive = activeProperties.filter(p => {
    const ownerDisplayId = getOwnerDisplayId(p.owner, p.ownerId, p.city?.name);
    const ownerName = p.owner?.name || "";
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      ownerDisplayId.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerId.toLowerCase().includes(search.toLowerCase()) ||
      p.price.toString().includes(search)
    );
  });

  const filteredArchived = archivedProperties.filter(p => {
    const ownerDisplayId = getOwnerDisplayId(p.owner, p.ownerId, p.city?.name);
    const ownerName = p.owner?.name || "";
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      ownerDisplayId.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerId.toLowerCase().includes(search.toLowerCase()) ||
      p.price.toString().includes(search)
    );
  });

  return (
    <div className="space-y-8 text-left relative">
      {/* Active Properties Card */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-accent" /> Active Properties
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage and edit active listings across all property owners and agents.</p>
          </div>
          <Link
            href="/properties/add"
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white font-bold px-4 py-2 rounded-xl text-xs transition duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Property
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-line shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties by title, owner ID, or price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-line rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-accent text-primary transition"
            />
          </div>
          <div className="text-xs font-mono font-semibold text-slate-400">
            {filteredActive.length} active listings
          </div>
        </div>

        {filteredActive.length === 0 ? (
          <div className="border border-line rounded-2xl p-12 text-center bg-secondary/35">
            <p className="text-xs text-slate-500 leading-relaxed">No active listed properties found.</p>
          </div>
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-line text-slate-700 text-xs tracking-wide">
                  <tr>
                    <th className="px-6 py-4 font-bold">Image</th>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Owner ID</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold text-center">Featured</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredActive.map((prop) => {
                    const coverUrl = prop.images && prop.images.length > 0
                      ? prop.images[0].url
                      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

                    return (
                      <tr key={prop.id} className="hover:bg-secondary/15 transition-colors">
                        <td className="px-6 py-4">
                          <img src={coverUrl} alt={prop.title} className="w-12 h-10 object-cover rounded border border-line" />
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary max-w-xs truncate">
                          <Link href={`/properties/${prop.id}`} className="hover:underline hover:text-accent">
                            {prop.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400 select-all max-w-[100px] truncate" title={getOwnerTooltip(prop.owner)}>
                          <span className="text-[11px] font-bold text-secondary bg-primary shadow-xs px-2.5 py-1 rounded border border-primary tracking-wider">
                            {getOwnerDisplayId(prop.owner, prop.ownerId, prop.city?.name)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide capitalize ${
                            prop.status === "ACTIVE" 
                              ? "bg-green-50 border border-green-200 text-green-700" 
                              : prop.status === "PENDING_VERIFICATION"
                              ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
                              : "bg-slate-50 border border-line text-slate-500"
                          }`}>
                            {prop.status.toLowerCase().replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                          ₹{prop.price.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(prop.id)}
                            className={`p-1.5 rounded transition ${
                              prop.isFeatured 
                                ? "text-amber-500 hover:text-amber-600 bg-amber-500/10" 
                                : "text-slate-300 hover:text-slate-500 hover:bg-secondary"
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/properties/${prop.id}/edit`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded transition border border-transparent hover:border-blue-100"
                              title="Edit listing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setArchivingId(prop.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition border border-transparent hover:border-red-100 cursor-pointer"
                              title="Soft delete (archive)"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}
      </div>

      {/* Deleted Properties Archive Card */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
            <Archive className="w-6 h-6 text-slate-500" /> Deleted Properties Archive
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review soft-deleted listings and restore them back to active list.</p>
        </div>

        {archivedProperties.length === 0 ? (
          <div className="border border-line border-dashed rounded-2xl p-12 text-center bg-secondary/15">
            <p className="text-xs text-slate-400">No properties in the deleted archive.</p>
          </div>
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-line text-slate-700 text-xs tracking-wide">
                  <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Owner ID</th>
                    <th className="px-6 py-4 font-bold">Reason</th>
                    <th className="px-6 py-4 font-bold text-right">Restore / Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredArchived.map((prop) => (
                    <tr key={prop.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{prop.title}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400 select-all max-w-[100px] truncate" title={getOwnerTooltip(prop.owner)}>
                        <span className="text-[11px] font-bold text-secondary bg-primary shadow-xs px-2.5 py-1 rounded border border-primary tracking-wider">
                          {getOwnerDisplayId(prop.owner, prop.ownerId, prop.city?.name)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                        By Admin: "{prop.rejectionReason || "N/A"}"
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => handleRestore(prop.id)}
                            disabled={actionLoading}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-transparent hover:border-emerald-100 transition cursor-pointer"
                            title="Restore to Active"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleHardDelete(prop.id)}
                            disabled={actionLoading}
                            className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-transparent hover:border-red-100 transition cursor-pointer"
                            title="Permanently Delete"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Archive Reason Modal */}
      {archivingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-xs" onClick={() => setArchivingId(null)}></div>
          <div className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 text-xs font-semibold space-y-4">
            <h4 className="font-serif text-sm font-semibold text-primary">Soft Delete Property</h4>
            <p className="text-slate-400">Specify why this property listing is being archived / soft deleted.</p>
            
            <textarea
              required
              rows={4}
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder="e.g. Owner requested removal, or violation of guidelines."
              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none"
            ></textarea>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setArchivingId(null)}
                className="border border-line hover:bg-secondary text-slate-500 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={actionLoading || !archiveReason}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Archive Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
