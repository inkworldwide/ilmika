"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Landmark, ArrowRight, X, Sparkles, Award, Globe } from "lucide-react";

import SearchableCountrySelect from "../ui/SearchableCountrySelect";
import { ALL_COUNTRIES } from "../../../prisma/data/allCountries";

interface Exam {
  id: string;
  name: string;
  fullName: string;
  stream: string | null;
  conductedBy: string | null;
  frequency: string | null;
  website: string | null;
  cutoffScore: string | null;
  acceptedCutoffs: string | null;
  country: {
    id: string;
    name: string;
    code: string;
    flag: string | null;
  } | null;
}

interface ExamsSearchContentProps {
  initialExams: Exam[];
}

export default function ExamsSearchContent({ initialExams }: ExamsSearchContentProps) {
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || searchParams.get("exam") || "");
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "");
  const [selectedStream, setSelectedStream] = useState(searchParams.get("stream") || "");

  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("exam") || "";
    const countryParam = searchParams.get("country") || "";
    const streamParam = searchParams.get("stream") || "";

    setSearchTerm(qParam);
    setSelectedCountry(countryParam);
    setSelectedStream(streamParam);
  }, [searchParams]);

  const allCountriesOptions = useMemo(() => {
    return ALL_COUNTRIES.map((c) => ({
      code: c.name,
      name: c.name,
      flag: c.flag,
    }));
  }, []);

  // Extract unique countries from exams
  const countryOptions = useMemo(() => {
    const map = new Map<string, string>();
    initialExams.forEach((e) => {
      if (e.country) {
        map.set(e.country.name, e.country.name);
      }
    });
    return Array.from(map.values()).sort();
  }, [initialExams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return initialExams.filter((exam) => {
      const q = searchTerm.toLowerCase().trim();

      // Country match check
      const matchesCountry = selectedCountry
        ? exam.country?.name.toLowerCase() === selectedCountry.toLowerCase()
        : true;

      // Stream match check
      const matchesStream = selectedStream
        ? exam.stream?.toLowerCase() === selectedStream.toLowerCase()
        : true;

      // Search term query match check (matches name, fullName, country, stream, conductedBy, cutoffScore, acceptedCutoffs)
      const matchesQuery = q
        ? exam.name.toLowerCase().includes(q) ||
          exam.fullName.toLowerCase().includes(q) ||
          (exam.country && exam.country.name.toLowerCase().includes(q)) ||
          (exam.stream && exam.stream.toLowerCase().includes(q)) ||
          (exam.conductedBy && exam.conductedBy.toLowerCase().includes(q)) ||
          (exam.cutoffScore && exam.cutoffScore.toLowerCase().includes(q)) ||
          (exam.acceptedCutoffs && exam.acceptedCutoffs.toLowerCase().includes(q))
        : true;

      return matchesCountry && matchesStream && matchesQuery;
    });
  }, [initialExams, searchTerm, selectedCountry, selectedStream]);

  const hasActiveFilters = searchTerm || selectedCountry || selectedStream;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedStream("");
  };

  return (
    <div className="space-y-8">
      {/* Search Bar & Country Quick Filters Container */}
      <div className="bg-white rounded-3xl p-6 border border-line shadow-sm space-y-5">
        {/* Input & Dropdown Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by country (e.g. India, USA, UK, Japan) or exam (JEE, SAT, NEET)..."
              className="w-full pl-11 pr-4 py-3.5 border border-line rounded-2xl text-xs md:text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-slate-50 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <SearchableCountrySelect
            countries={allCountriesOptions}
            value={selectedCountry}
            onChange={(val) => setSelectedCountry(val)}
            placeholder="All Countries"
            className="min-w-[170px]"
          />
        </div>

        {/* Quick Country Buttons */}
        <div className="space-y-2 pt-1 border-t border-line">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent" /> Popular Destination Exams
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCountry("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                !selectedCountry
                  ? "bg-primary text-accent font-bold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {countryOptions.map((countryName) => (
              <button
                key={countryName}
                onClick={() =>
                  setSelectedCountry(selectedCountry === countryName ? "" : countryName)
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCountry === countryName
                    ? "bg-accent text-primary font-bold shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {countryName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
        <p>
          Showing <span className="font-bold text-primary">{filteredExams.length}</span> entrance exam{filteredExams.length === 1 ? "" : "s"}
        </p>
        {selectedCountry && (
          <p className="font-mono text-accent font-bold">
            Country: {selectedCountry}
          </p>
        )}
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white border border-line rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-3xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
              Admission Guidelines Notice
            </span>
            <h3 className="font-serif text-2xl font-bold text-primary">
              {selectedCountry
                ? `Direct Academic Admission in ${selectedCountry}`
                : "No Specific Entrance Exam Required"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto font-medium">
              {selectedCountry ? (
                <>
                  Higher education institutions in <strong>{selectedCountry}</strong> do not enforce a single centralized national entrance examination for international students. Admissions are primarily evaluated on <strong>High School Transcripts / GPA</strong>, secondary school certificates, and language proficiency tests (<strong>IELTS / TOEFL / Duolingo</strong>).
                </>
              ) : (
                <>
                  No specific entrance exam was found for this search. Many countries admit students directly using secondary school marks, academic portfolios, and English language proficiency scores.
                </>
              )}
            </p>
          </div>

          <div className="bg-secondary border border-line rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 text-left max-w-xl mx-auto">
            <p className="font-bold text-primary flex items-center gap-1.5 font-mono text-[11px] uppercase">
              🏛️ Standard Admission Requirements in {selectedCountry || "this region"}:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>High School Certificate / Bachelor's Degree Transcripts</li>
              <li>Standardized Language Proficiency (IELTS 6.5+ / TOEFL 90+)</li>
              <li>Statement of Purpose (SOP) &amp; Recommendation Letters</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={selectedCountry ? `/colleges?q=${encodeURIComponent(selectedCountry)}` : "/colleges"}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-primary font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-sm"
            >
              Browse Colleges in {selectedCountry || "Worldwide"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-line rounded-3xl p-6 space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-2xl bg-primary text-accent flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {exam.name.slice(0, 4)}
                    </span>
                    {exam.country && (
                      <span className="text-xs font-semibold text-slate-600 bg-secondary border border-line px-2.5 py-1 rounded-lg">
                        {exam.country.name}
                      </span>
                    )}
                  </div>
                  {exam.stream && (
                    <span className="text-[10px] font-mono font-bold uppercase text-accent bg-accent/10 px-2.5 py-1 rounded-full shrink-0">
                      {exam.stream.replace("_", " ")}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-primary">{exam.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{exam.fullName}</p>
                </div>

                {/* Cutoff Highlights */}
                {exam.cutoffScore && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">
                      🎯 Qualifying Cutoff Range
                    </span>
                    <p className="text-xs font-bold text-amber-900">{exam.cutoffScore}</p>
                  </div>
                )}

                {/* Top College Cutoffs */}
                {exam.acceptedCutoffs && (
                  <div className="bg-secondary border border-line rounded-2xl p-3.5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      🏛️ Major College Cutoff Marks
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {exam.acceptedCutoffs}
                    </p>
                  </div>
                )}

                <div className="bg-white border border-line rounded-xl p-3 space-y-1 text-xs text-slate-600 font-medium">
                  {exam.conductedBy && (
                    <p>
                      <strong>Conducted By:</strong> {exam.conductedBy}
                    </p>
                  )}
                  {exam.frequency && (
                    <p>
                      <strong>Frequency:</strong> {exam.frequency}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-line pt-4 mt-2 flex items-center justify-between">
                <Link
                  href={`/colleges?q=${encodeURIComponent(exam.name)}`}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase"
                >
                  Accepting Colleges <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {exam.website && (
                  <a
                    href={exam.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono font-bold text-slate-400 hover:text-primary transition"
                  >
                    Official Site ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
