"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Search, Eye } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";

export default function DashboardSavedPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/dashboard/saved");
        const data = await res.json();
        if (data.properties) setProperties(data.properties);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading saved listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Saved Listings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage and view properties you have shortlisted.</p>
      </div>

      {properties.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">Shortlist is empty</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Shortlist properties while browsing to easily compare them and keep track of updates.
          </p>
          <Link
            href="/properties"
            className="bg-primary text-secondary font-semibold px-6 py-2.5 rounded-full hover:bg-slate-800 transition text-xs inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
