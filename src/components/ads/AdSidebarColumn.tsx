"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Megaphone } from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement?: string;
  format?: "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID";
}

interface AdSidebarColumnProps {
  page?: "home" | "colleges" | "college_detail" | "scholarships" | "exams" | "inner";
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

  // Group ads for sidebar layout:
  // - FULL_WIDTH: 100% full width banner
  // - HALF_WIDTH: Pair 2 side-by-side (2 columns)
  // - QUAD_GRID: Group up to 4 items into a 2x2 combined 4-column block inside sidebar
  const adRows: { type: "FULL" | "HALF_PAIR" | "QUAD"; items: AdItem[] }[] = [];
  let i = 0;
  while (i < ads.length) {
    const current = ads[i];
    if (current.format === "QUAD_GRID") {
      const quadItems: AdItem[] = [current];
      let count = 1;
      while (count < 4 && i + count < ads.length && ads[i + count].format === "QUAD_GRID") {
        quadItems.push(ads[i + count]);
        count++;
      }
      adRows.push({ type: "QUAD", items: quadItems });
      i += count;
    } else if (current.format === "HALF_WIDTH") {
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
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 px-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
          <Megaphone className="w-4 h-4 text-[#D4AF37]" />
          <span>{title}</span>
        </div>
        <span className="text-[9px] font-mono font-semibold bg-amber-500/10 text-amber-900 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          SPONSORED
        </span>
      </div>

      {/* Ad Rows Layout Stack - Flows naturally along with page scroll */}
      <div className="flex flex-col gap-4">
        {adRows.map((row, rowIdx) => {
          if (row.type === "FULL") {
            const ad = row.items[0];
            return (
              <div
                key={ad.id || rowIdx}
                onClick={() => handleAdClick(ad)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/70 transition-all duration-300 bg-white cursor-pointer"
              >
                {/* Full Width Banner Image */}
                <div className="relative aspect-[3.2/1] w-full overflow-hidden bg-slate-100">
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  
                  {/* Gradient Overlay & Hover Title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/40 to-transparent opacity-90 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white leading-tight font-serif drop-shadow-xs line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {ad.name}
                      </p>
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-sm">
                        <ExternalLink className="w-3 h-3 font-bold" />
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-300 font-mono font-medium mt-0.5 flex items-center gap-1">
                      <span>Full Banner</span> • <span>Click to Visit →</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          if (row.type === "QUAD") {
            return (
              <div key={rowIdx} className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B132B] border border-[#D4AF37]/35 p-3 rounded-3xl shadow-xl space-y-2.5">
                {/* Ambient Gold Glow Backdrop */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between px-1 text-[9.5px] font-mono font-bold tracking-wider text-amber-300 border-b border-slate-700/60 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    FEATURED PROMOTIONS
                  </span>
                  <span className="text-[8px] bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2 py-0.5 rounded-full text-amber-200">
                    VERIFIED
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  {row.items.map((ad, idx) => {
                    const isFullSpan = row.items.length === 1 || (row.items.length === 3 && idx === 0);
                    return (
                      <div
                        key={ad.id}
                        onClick={() => handleAdClick(ad)}
                        className={`group relative overflow-hidden rounded-2xl border border-slate-700/70 hover:border-[#D4AF37] transition duration-300 bg-slate-950/90 shadow-md hover:shadow-xl cursor-pointer flex flex-col ${
                          isFullSpan ? "col-span-2" : ""
                        }`}
                      >
                        <div className={`relative w-full overflow-hidden bg-slate-800 ${isFullSpan ? "aspect-[2.8/1]" : "aspect-[1.5/1]"}`}>
                          <img
                            src={ad.imageUrl}
                            alt={ad.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0F172A] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition">
                            <ExternalLink className="w-2.5 h-2.5 font-bold" />
                          </div>
                        </div>
                        <div className="p-2.5 bg-gradient-to-b from-[#0F172A] to-[#0B132B] text-white flex-1 flex flex-col justify-between space-y-1">
                          <p className="text-[10.5px] font-bold text-slate-100 leading-snug font-serif line-clamp-2 group-hover:text-amber-300 transition-colors">
                            {ad.name}
                          </p>
                          <span className="text-[8px] text-amber-300 font-mono font-medium flex items-center gap-1 pt-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                            Featured Ad →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // HALF_PAIR: Render 2-column side-by-side grid cards (or full width if single)
          return (
            <div key={rowIdx} className="grid grid-cols-2 gap-2.5">
              {row.items.map((ad) => {
                const isSingle = row.items.length === 1;
                return (
                  <div
                    key={ad.id}
                    onClick={() => handleAdClick(ad)}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#D4AF37]/60 transition-all duration-300 bg-white cursor-pointer flex flex-col ${
                      isSingle ? "col-span-2" : ""
                    }`}
                  >
                    <div className={`relative w-full overflow-hidden bg-slate-100 ${isSingle ? "aspect-[3.2/1]" : "aspect-[1.6/1]"}`}>
                      <img
                        src={ad.imageUrl}
                        alt={ad.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-xs">
                        <ExternalLink className="w-2.5 h-2.5 font-bold" />
                      </div>
                    </div>
                    <div className="p-2.5 bg-gradient-to-b from-[#0F172A] to-[#0B132B] text-white flex-1 flex flex-col justify-between">
                      <p className="text-[10.5px] font-bold text-slate-100 leading-snug font-serif line-clamp-2 group-hover:text-amber-300 transition-colors">
                        {ad.name}
                      </p>
                      <span className="text-[8px] text-amber-300 font-mono font-medium mt-1">
                        Featured Ad • Visit →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
