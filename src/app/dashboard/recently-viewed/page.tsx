"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Search } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";

export default function DashboardRecentlyViewedPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        const res = await fetch("/api/dashboard/recently-viewed");
        const data = await res.json();
        if (data.properties) setProperties(data.properties);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecentlyViewed();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Recently Viewed</h2>
        <p className="text-xs text-slate-500 mt-1">Review houses and listings you have recently checked out.</p>
      </div>

      {properties.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">History is clean</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            As you browse colleges, universities, and programmes on ILMIKA, your history will populate here.
          </p>
          <Link
            href="/properties"
            className="bg-primary text-secondary font-semibold px-6 py-2.5 rounded-full hover:bg-slate-800 transition text-xs inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Browse Properties
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
