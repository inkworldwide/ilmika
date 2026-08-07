"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { ALL_COUNTRIES } from "../../../prisma/data/allCountries";
import SearchableCountrySelect from "../ui/SearchableCountrySelect";

interface HeroSearchFormProps {
  countries?: { code: string; name: string }[];
}

const STREAM_MAP: Record<string, string> = {
  engineering: "ENGINEERING",
  btech: "ENGINEERING",
  mtech: "ENGINEERING",
  tech: "ENGINEERING",
  medical: "MEDICAL",
  mbbs: "MEDICAL",
  health: "MEDICAL",
  medicine: "MEDICAL",
  management: "MANAGEMENT",
  mba: "MANAGEMENT",
  bba: "MANAGEMENT",
  business: "MANAGEMENT",
  law: "LAW",
  llb: "LAW",
  llm: "LAW",
  legal: "LAW",
  arts: "ARTS font",
  humanities: "ARTS",
  ba: "ARTS",
  ma: "ARTS",
  commerce: "COMMERCE",
  bcom: "COMMERCE",
  mcom: "COMMERCE",
  finance: "COMMERCE",
  science: "SCIENCE",
  bsc: "SCIENCE",
  msc: "SCIENCE",
  design: "DESIGN",
  bdes: "DESIGN",
  mdes: "DESIGN",
  architecture: "DESIGN",
  barch: "DESIGN",
  it: "INFORMATION_TECHNOLOGY",
  computing: "INFORMATION_TECHNOLOGY",
  computer: "INFORMATION_TECHNOLOGY font",
  software: "INFORMATION_TECHNOLOGY",
  mca: "INFORMATION_TECHNOLOGY",
  bca: "INFORMATION_TECHNOLOGY",
  pharmacy: "PHARMACY",
  bpharm: "PHARMACY",
  mpharm: "PHARMACY",
  nursing: "NURSING",
  agriculture: "AGRICULTURE",
  hotel: "HOTEL_MANAGEMENT",
  hospitality: "HOTEL_MANAGEMENT",
};

const DEGREE_MAP: Record<string, string> = {
  bachelor: "BACHELOR",
  bachelors: "BACHELOR",
  undergraduate: "BACHELOR",
  master: "MASTER",
  masters: "MASTER",
  postgraduate: "MASTER",
  phd: "PHD",
  doctorate: "PHD",
  diploma: "DIPLOMA",
};

export default function HeroSearchForm({ countries = [] }: HeroSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const cleanQuery = query.trim();

    if (cleanQuery) {
      params.set("q", cleanQuery);

      // Auto-detect stream from query
      const lowerQuery = cleanQuery.toLowerCase();
      for (const [key, streamVal] of Object.entries(STREAM_MAP)) {
        if (lowerQuery.includes(key)) {
          params.set("stream", streamVal);
          break;
        }
      }

      // Auto-detect degree from query
      for (const [key, degreeVal] of Object.entries(DEGREE_MAP)) {
        if (lowerQuery.includes(key)) {
          params.set("degree", degreeVal);
          break;
        }
      }
    }

    if (selectedCountry) {
      params.set("country", selectedCountry);
    }

    const queryString = params.toString();
    router.push(queryString ? `/colleges?${queryString}` : "/colleges");
  };

  const countryList = countries.length > 0 ? countries : ALL_COUNTRIES;

  return (
    <div className="space-y-3.5 max-w-2xl">
      <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-2.5 shadow-2xl shadow-black/40 border border-white/60 ring-1 ring-black/5 flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 flex items-center px-3.5 gap-2.5 bg-slate-50/90 rounded-xl md:rounded-2xl border border-slate-200 focus-within:border-[#D4AF37] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition group">
          <Search className="w-4.5 h-4.5 text-[#D4AF37] shrink-0 group-focus-within:scale-110 transition duration-200" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search university, programme, or stream..."
            className="w-full py-3.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
          />
        </div>

        <SearchableCountrySelect
          countries={countryList}
          value={selectedCountry}
          onChange={(code) => setSelectedCountry(code)}
          placeholder="All Countries"
          className="min-w-[170px]"
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] hover:brightness-105 text-[#0F172A] font-bold px-7 py-3.5 rounded-xl md:rounded-2xl inline-flex items-center justify-center gap-2 transition duration-200 text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/25 shrink-0 cursor-pointer border border-amber-300/40"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Search Tag Pills */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 pl-1">
        <span className="font-bold text-[#FDE68A] uppercase tracking-wider text-[10px]">Popular:</span>
        {[
          { label: "Engineering", query: "engineering" },
          { label: "MBA / Management", query: "mba" },
          { label: "Medicine / MBBS", query: "mbbs" },
          { label: "Computer Science", query: "computer science" },
          { label: "Law", query: "law" },
        ].map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => {
              setQuery(tag.query);
              const params = new URLSearchParams();
              params.set("q", tag.query);
              if (selectedCountry) params.set("country", selectedCountry);
              router.push(`/colleges?${params.toString()}`);
            }}
            className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-[#D4AF37]/50 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg transition duration-150 cursor-pointer font-medium shadow-xs"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
