"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Megaphone } from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement?: string;
  format?: "FULL_WIDTH" | "HALF_WIDTH";
}

interface AdSidebarColumnProps {
  page?: "home" | "inner";
  className?: string;
  title?: string;
}

export default function AdSidebarColumn({ page = "home", className = "", title = "Featured Buzz" }: AdSidebarColumnProps) {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      try {
        const res = await fetch(`/api/ads?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setAds(data.ads || []);
        }
      } catch (err) {
        console.error("Ad loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, [page]);

  const handleAdClick = (ad: AdItem) => {
    if (ad.id) {
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id }),
      }).catch(() => {});
    }
    window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
  };

  if (loading || ads.length === 0) {
    return null;
  }

  // Group ads for layout: pair consecutive HALF_WIDTH ads into 2-column grid rows, keep FULL_WIDTH as full 100% banners
  const adRows: { type: "FULL" | "HALF_PAIR"; items: AdItem[] }[] = [];
  let i = 0;
  while (i < ads.length) {
    const current = ads[i];
    if (current.format === "HALF_WIDTH") {
      const pair: AdItem[] = [current];
      if (i + 1 < ads.length && ads[i + 1].format === "HALF_WIDTH") {
        pair.push(ads[i + 1]);
        i += 2;
      } else {
        i += 1;
      }
      adRows.push({ type: "HALF_PAIR", items: pair });
    } else {
      adRows.push({ type: "FULL", items: [current] });
      i += 1;
    }
  }

  return (
    <aside className={`w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-4 font-sans text-left ${className}`}>
      {/* Sidebar Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 px-1 bg-white/80 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
          <Megaphone className="w-4 h-4 text-[#D4AF37]" />
          <span>{title}</span>
        </div>
        <span className="text-[9px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
          SPONSORED
        </span>
      </div>

      {/* Ad Rows Layout Stack - Flows naturally along with page scroll */}
      <div className="flex flex-col gap-3.5">
        {adRows.map((row, rowIdx) => {
          if (row.type === "FULL") {
            const ad = row.items[0];
            return (
              <div
                key={ad.id || rowIdx}
                onClick={() => handleAdClick(ad)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-[#D4AF37]/60 transition-all duration-300 bg-white cursor-pointer"
              >
                {/* Full Width Banner Image */}
                <div className="relative aspect-[3.2/1] w-full overflow-hidden bg-slate-100">
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Gradient Overlay & Hover Title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent opacity-85 group-hover:opacity-95 transition duration-300 flex flex-col justify-end p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white leading-tight font-serif drop-shadow-xs line-clamp-1">
                        {ad.name}
                      </p>
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-xs">
                        <ExternalLink className="w-3 h-3 font-bold" />
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-300 font-mono font-medium mt-0.5 flex items-center gap-1">
                      <span>Full Ad</span> • <span>Click to Visit</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // HALF_PAIR: Render 2-column side-by-side grid cards
          return (
            <div key={rowIdx} className="grid grid-cols-2 gap-2.5">
              {row.items.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => handleAdClick(ad)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#D4AF37]/60 transition-all duration-300 bg-white cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[1.6/1] w-full overflow-hidden bg-slate-100">
                    <img
                      src={ad.imageUrl}
                      alt={ad.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-xs">
                      <ExternalLink className="w-2.5 h-2.5 font-bold" />
                    </div>
                  </div>
                  <div className="p-2 bg-[#0F172A] text-white flex-1 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-100 leading-tight font-serif line-clamp-2">
                      {ad.name}
                    </p>
                    <span className="text-[8px] text-amber-300 font-mono font-medium mt-1">
                      Half Ad • Visit →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
