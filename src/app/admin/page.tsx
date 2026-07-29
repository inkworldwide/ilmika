"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, X, Eye, AlertCircle, FileText, Send } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  price: number;
  transactionType: string;
  propertyType: string;
  status: string;
  createdAt: string;
  locality: { name: string };
  city: { name: string };
  images: Array<{ url: string }>;
}

export default function AdminVerificationQueue() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal control
  const [rejectingPropertyId, setRejectingPropertyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerify = async (propertyId: string, status: "ACTIVE" | "REJECTED", reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          status,
          rejectionReason: reason || null,
        }),
      });

      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        setRejectingPropertyId(null);
        setRejectionReason("");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update property status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading pending verifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left relative">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-accent" /> Verification Queue
        </h2>
        <p className="text-xs text-slate-500 mt-1">Review new and modified property listings to confirm RERA, images, and description accuracy.</p>
      </div>

      <div className="mb-4 text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
        {properties.length} listings awaiting review
      </div>

      {properties.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">Queue is Clear</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All submitted property listings have been verified and processed. Good job!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const coverUrl = prop.images && prop.images.length > 0
              ? prop.images[0].url
              : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

            const formattedPrice = prop.price >= 10000000 
              ? `₹${(prop.price / 10000000).toFixed(2)} Cr` 
              : prop.price >= 100000 
              ? `₹${(prop.price / 100000).toFixed(2)} L` 
              : `₹${prop.price.toLocaleString("en-IN")}`;

            const dateStr = new Date(prop.createdAt).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric"
            });

            return (
              <div key={prop.id} className="bg-white border border-line rounded-xl overflow-hidden shadow-xs flex flex-col sm:flex-row gap-4 p-4">
                
                {/* Image */}
                <div className="aspect-[4/3] w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                  <img src={coverUrl} alt={prop.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-primary text-secondary text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    {prop.transactionType}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-primary">{prop.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Submitted: {dateStr}</p>
                    <p className="text-slate-500 mt-1">{prop.locality.name}, {prop.city.name}</p>
                    <p className="font-mono text-accent font-semibold mt-1">
                      {formattedPrice}{prop.transactionType === "RENT" ? "/mo" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => handleVerify(prop.id, "ACTIVE")}
                      type="button"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Verify &amp; Publish
                    </button>
                    <button
                      onClick={() => setRejectingPropertyId(prop.id)}
                      type="button"
                      disabled={actionLoading}
                      className="border border-line hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-500 font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline Listing
                    </button>
                    <Link
                      href={`/properties/${prop.id}`}
                      target="_blank"
                      className="border border-line hover:bg-secondary text-slate-600 font-semibold px-3 py-1.5 rounded transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview details
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Rejection Modal Drawer */}
      {rejectingPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-xs" onClick={() => setRejectingPropertyId(null)}></div>
          <div className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 text-xs font-semibold space-y-4">
            <h4 className="font-serif text-sm font-semibold text-primary flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" /> Decline Listing
            </h4>
            <p className="text-slate-400">Specify why this property is being rejected. This feedback will be sent directly to the owner.</p>
            
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. RERA ID is invalid, or carpet area does not match configuration guidelines."
              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none"
            ></textarea>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingPropertyId(null)}
                type="button"
                className="px-4 py-2 border border-line rounded-lg hover:bg-secondary font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectingPropertyId, "REJECTED", rejectionReason)}
                disabled={actionLoading || !rejectionReason.trim()}
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
