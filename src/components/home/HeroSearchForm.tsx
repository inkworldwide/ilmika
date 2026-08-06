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
    <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2.5 shadow-2xl border border-white/20 flex flex-col sm:flex-row gap-2.5 max-w-2xl">
      <div className="flex-1 flex items-center px-3 gap-2 bg-slate-50 rounded-xl border border-line focus-within:border-accent transition">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search college, course, or stream..."
          className="w-full py-3 text-xs md:text-sm text-primary placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      <SearchableCountrySelect
        countries={countryList}
        value={selectedCountry}
        onChange={(code) => setSelectedCountry(code)}
        placeholder="All Countries"
        className="min-w-[160px]"
      />

      <button
        type="submit"
        className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3.5 rounded-xl inline-flex items-center justify-center gap-2 transition text-xs uppercase tracking-wider shadow-md shrink-0 cursor-pointer"
      >
        <span>Search</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
