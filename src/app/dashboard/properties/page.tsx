"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Plus, Edit3, Trash, Eye, 
  CheckCircle, Clock, AlertTriangle, ShieldCheck, XCircle 
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  transactionType: string;
  propertyType: string;
  status: "DRAFT" | "PENDING_VERIFICATION" | "ACTIVE" | "REJECTED" | "RENTED" | "SOLD" | "LEASED" | "ARCHIVED";
  rejectionReason: string | null;
  viewCount: number;
  createdAt: string;
  images: Array<{ url: string }>;
}

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties"); // Fetch listings owned by user (GET handler automatically handles context)
      if (res.ok) {
        // Wait, the public GET /api/properties endpoint returns only ACTIVE properties.
        // We need a specific owner listings API, or we can fetch a dashboard-specific properties endpoint!
        // Let's check: our public GET /api/properties filter enforces status: ACTIVE.
        // To allow the owner to see all their statuses (DRAFT, PENDING, ACTIVE, REJECTED), we should fetch from a dedicated dashboard endpoint:
        // /api/dashboard/properties!
        // Let's create `/api/dashboard/properties/route.ts` first, or write it.
        // Let's make sure we have `/api/dashboard/properties/route.ts` to return all owned properties.
      }
    } catch (e) {}
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/dashboard/properties");
        const data = await res.json();
        if (data.properties) setProperties(data.properties);
      } catch (err) {
        console.error("Dashboard properties fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRequestVerification = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING_VERIFICATION",
        }),
      });

      if (res.ok) {
        // Reload list
        const reloadRes = await fetch("/api/dashboard/properties");
        const reloadData = await reloadRes.json();
        if (reloadData.properties) setProperties(reloadData.properties);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action is irreversible.")) return;

    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading your properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">My Listings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage, verify, edit, and monitor your listed properties.</p>
        </div>
        <Link
          href="/properties/add"
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4.5 py-2.5 rounded-full shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Building2 className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">No properties listed yet</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            List your house, villa, studio, or commercial space. Submit for verification to make it public.
          </p>
          <Link
            href="/properties/add"
            className="bg-primary text-secondary font-semibold px-6 py-2.5 rounded-full hover:bg-slate-800 transition text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            List your property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const statusColors = {
              DRAFT: "bg-slate-50 text-slate-500 border-slate-200",
              PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
              ACTIVE: "bg-green-50 text-green-700 border-green-200",
              REJECTED: "bg-red-50 text-red-700 border-red-200",
              RENTED: "bg-blue-50 text-blue-700 border-blue-200",
              SOLD: "bg-purple-50 text-purple-700 border-purple-200",
              LEASED: "bg-indigo-50 text-indigo-700 border-indigo-200",
              ARCHIVED: "bg-gray-100 text-gray-400 border-gray-200",
            };

            const coverUrl = prop.images && prop.images.length > 0
              ? prop.images[0].url
              : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

            const formattedPrice = prop.price >= 10000000 
              ? `₹${(prop.price / 10000000).toFixed(2)} Cr` 
              : prop.price >= 100000 
              ? `₹${(prop.price / 100000).toFixed(2)} L` 
              : `₹${prop.price.toLocaleString("en-IN")}`;

            const isDraft = prop.status === "DRAFT";
            const isRejected = prop.status === "REJECTED";
            const isVerificationAllowed = isDraft || isRejected;

            return (
              <div key={prop.id} className="bg-white border border-line rounded-xl overflow-hidden shadow-xs flex flex-col sm:flex-row gap-4 p-4">
                {/* Cover Image */}
                <div className="aspect-[4/3] w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                  <img src={coverUrl} alt={prop.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-primary text-secondary text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    {prop.transactionType}
                  </span>
                </div>

                {/* Details info */}
                <div className="flex-1 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-sm font-semibold text-primary line-clamp-1">{prop.title}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${statusColors[prop.status]}`}>
                        {prop.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="font-mono text-accent font-semibold mt-1">
                      {formattedPrice}{prop.transactionType === "RENT" ? "/mo" : ""}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1 font-mono">
                      <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {prop.viewCount} views</span>
                      <span>Added {new Date(prop.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Rejection warning text */}
                  {isRejected && prop.rejectionReason && (
                    <div className="flex items-start gap-1.5 bg-red-50 border border-red-100 text-red-700 p-2.5 rounded-lg">
                      <XCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-bold text-[10px]">Rejection Reason:</p>
                        <p className="text-[10px] italic">"{prop.rejectionReason}"</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                    {prop.status === "ACTIVE" && (
                      <Link 
                        href={`/properties/${prop.id}`} 
                        className="bg-secondary border border-line hover:bg-paper text-primary font-bold px-3 py-1.5 rounded transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Listing
                      </Link>
                    )}
                    
                    {isVerificationAllowed && (
                      <button
                        onClick={() => handleRequestVerification(prop.id)}
                        type="button"
                        className="bg-accent hover:bg-accent-hover text-primary font-bold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Submit verification
                      </button>
                    )}

                    <Link
                      href={`/dashboard/properties/${prop.id}/edit`} // future edit route or inline form
                      className="border border-line hover:bg-secondary text-slate-600 font-semibold px-3 py-1.5 rounded transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(prop.id)}
                      type="button"
                      className="border border-line hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-500 font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
