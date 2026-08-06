"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CollegeCard from "@/components/property/CollegeCard";
import SearchableCountrySelect from "../ui/SearchableCountrySelect";
import { Search, SlidersHorizontal, X, ChevronDown, Globe, GraduationCap, BookOpen, Filter } from "lucide-react";

const STREAMS = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "MEDICAL", label: "Medical & Health" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "LAW", label: "Law" },
  { value: "ARTS", label: "Arts & Humanities" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "SCIENCE", label: "Science" },
  { value: "DESIGN", label: "Design & Architecture" },
  { value: "INFORMATION_TECHNOLOGY", label: "IT & Computing" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "EDUCATION", label: "Education" },
  { value: "HOTEL_MANAGEMENT", label: "Hotel Management" },
  { value: "NURSING", label: "Nursing" },
  { value: "SOCIAL_SCIENCE", label: "Social Science" },
  { value: "MEDIA", label: "Media & Communication" },
];

const DEGREES = [
  { value: "BACHELOR", label: "Bachelor's" },
  { value: "MASTER", label: "Master's" },
  { value: "PHD", label: "PhD / Doctorate" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "INTEGRATED", label: "Integrated" },
  { value: "ASSOCIATE", label: "Associate" },
];

const MODES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "ONLINE", label: "Online" },
  { value: "DISTANCE", label: "Distance" },
  { value: "HYBRID", label: "Hybrid" },
];

const COLLEGE_TYPES = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE", label: "Private" },
  { value: "DEEMED", label: "Deemed" },
  { value: "AUTONOMOUS", label: "Autonomous" },
  { value: "CENTRAL", label: "Central" },
  { value: "INTERNATIONAL", label: "International" },
];

export default function CollegesSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [stream, setStream] = useState(searchParams.get("stream") || "");
  const [degree, setDegree] = useState(searchParams.get("degree") || "");
  const [mode, setMode] = useState(searchParams.get("mode") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [cityId, setCityId] = useState(searchParams.get("cityId") || "");
  const [collegeType, setCollegeType] = useState(searchParams.get("collegeType") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("isVerified") === "true");
  const [scholarshipOnly, setScholarshipOnly] = useState(searchParams.get("scholarship") === "true");
  const [maxFees, setMaxFees] = useState(searchParams.get("maxFees") || "");
  const [isCustomFee, setIsCustomFee] = useState(false);
  const [customCurrency, setCustomCurrency] = useState("INR");
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [page, setPage] = useState(1);

  const CURRENCY_RATES: Record<string, number> = {
    INR: 1,
    USD: 85,
    EUR: 92,
    GBP: 108,
    CAD: 62,
    AUD: 55,
  };

  const handleCustomFeeApply = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmountInput);
    if (!isNaN(val) && val > 0) {
      const rate = CURRENCY_RATES[customCurrency] || 1;
      const inINR = Math.round(val * rate);
      setMaxFees(inINR.toString());
      setPage(1);
    }
  };

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
  }, []);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (stream) params.set("stream", stream);
    if (degree) params.set("degree", degree);
    if (mode) params.set("mode", mode);
    if (country) params.set("country", country);
    if (cityId) params.set("cityId", cityId);
    if (collegeType) params.set("collegeType", collegeType);
    if (verifiedOnly) params.set("isVerified", "true");
    if (scholarshipOnly) params.set("scholarship", "true");
    if (maxFees) params.set("maxFees", maxFees);
    params.set("page", page.toString());
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/colleges?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setColleges(data.colleges || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error("Failed to fetch colleges", e);
    } finally {
      setLoading(false);
    }
  }, [search, stream, degree, mode, country, cityId, collegeType, verifiedOnly, scholarshipOnly, maxFees, page]);

  useEffect(() => {
    const qVal = searchParams.get("q") || "";
    const streamParam = searchParams.get("stream") || "";
    const degreeParam = searchParams.get("degree") || "";

    let autoStream = streamParam;
    if (!autoStream && qVal) {
      const lower = qVal.toLowerCase();
      const STREAM_MAP: Record<string, string> = {
        engineering: "ENGINEERING", btech: "ENGINEERING", mtech: "ENGINEERING", tech: "ENGINEERING",
        medical: "MEDICAL", mbbs: "MEDICAL", health: "MEDICAL", medicine: "MEDICAL",
        management: "MANAGEMENT", mba: "MANAGEMENT", bba: "MANAGEMENT", business: "MANAGEMENT",
        law: "LAW", llb: "LAW", llm: "LAW", legal: "LAW",
        arts: "ARTS", humanities: "ARTS", ba: "ARTS", ma: "ARTS",
        commerce: "COMMERCE", bcom: "COMMERCE", mcom: "COMMERCE", finance: "COMMERCE",
        science: "SCIENCE", bsc: "SCIENCE", msc: "SCIENCE",
        design: "DESIGN", bdes: "DESIGN", mdes: "DESIGN", architecture: "DESIGN",
        it: "INFORMATION_TECHNOLOGY", computing: "INFORMATION_TECHNOLOGY", computer: "INFORMATION_TECHNOLOGY", mca: "INFORMATION_TECHNOLOGY", bca: "INFORMATION_TECHNOLOGY",
        pharmacy: "PHARMACY", bpharm: "PHARMACY", mpharm: "PHARMACY",
        nursing: "NURSING", agriculture: "AGRICULTURE", hotel: "HOTEL_MANAGEMENT", hospitality: "HOTEL_MANAGEMENT",
      };
      for (const [k, v] of Object.entries(STREAM_MAP)) {
        if (lower.includes(k)) { autoStream = v; break; }
      }
    }

    let autoDegree = degreeParam;
    if (!autoDegree && qVal) {
      const lower = qVal.toLowerCase();
      const DEGREE_MAP: Record<string, string> = {
        bachelor: "BACHELOR", bachelors: "BACHELOR", undergraduate: "BACHELOR",
        master: "MASTER", masters: "MASTER", postgraduate: "MASTER",
        phd: "PHD", doctorate: "PHD", diploma: "DIPLOMA",
      };
      for (const [k, v] of Object.entries(DEGREE_MAP)) {
        if (lower.includes(k)) { autoDegree = v; break; }
      }
    }

    setSearch(qVal);
    setStream(autoStream);
    setDegree(autoDegree);
    setMode(searchParams.get("mode") || "");
    setCountry(searchParams.get("country") || "");
    setCityId(searchParams.get("cityId") || "");
    setCollegeType(searchParams.get("collegeType") || "");
    setVerifiedOnly(searchParams.get("isVerified") === "true");
    setScholarshipOnly(searchParams.get("scholarship") === "true");
    setMaxFees(searchParams.get("maxFees") || "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const clearFilters = () => {
    setSearch(""); setStream(""); setDegree(""); setMode("");
    setCountry(""); setCityId(""); setCollegeType(""); setVerifiedOnly(false); setScholarshipOnly(false);
    setMaxFees("");
    setPage(1);
  };

  const hasFilters = Boolean(search || stream || degree || mode || country || cityId || collegeType || verifiedOnly || scholarshipOnly || maxFees);

  const filterCount = [stream, degree, mode, country, cityId, collegeType, verifiedOnly, scholarshipOnly, maxFees].filter(Boolean).length;

  const renderFilterControls = () => (
    <div className="space-y-5">
      {/* Stream */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-accent" /> Stream
        </label>
        <select value={stream} onChange={e => { setStream(e.target.value); setPage(1); }}
          className="w-full border border-line rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-accent bg-white">
          <option value="">All Streams</option>
          {STREAMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Degree */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-accent" /> Degree Type
        </label>
        <select value={degree} onChange={e => { setDegree(e.target.value); setPage(1); }}
          className="w-full border border-line rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-accent bg-white">
          <option value="">All Degrees</option>
          {DEGREES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Study Mode */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Study Mode</label>
        <select value={mode} onChange={e => { setMode(e.target.value); setPage(1); }}
          className="w-full border border-line rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-accent bg-white">
          <option value="">All Modes</option>
          {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Country */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Globe className="w-3.5 h-3.5 text-accent" /> Country
        </label>
        <SearchableCountrySelect
          countries={countries}
          value={country}
          onChange={val => { setCountry(val); setPage(1); }}
          placeholder="All Countries"
          className="w-full"
        />
      </div>

      {/* College Type */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">College Type</label>
        <select value={collegeType} onChange={e => { setCollegeType(e.target.value); setPage(1); }}
          className="w-full border border-line rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-accent bg-white">
          <option value="">All Types</option>
          {COLLEGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Annual Tuition Fees */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Max Annual Fee</span>
          {maxFees && (
            <button
              onClick={() => {
                setMaxFees("");
                setCustomAmountInput("");
                setIsCustomFee(false);
                setPage(1);
              }}
              className="text-[10px] text-red-500 hover:underline font-mono font-normal lowercase"
            >
              reset fee
            </button>
          )}
        </label>

        <select
          value={isCustomFee ? "custom" : maxFees}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "custom") {
              setIsCustomFee(true);
            } else {
              setIsCustomFee(false);
              setMaxFees(val);
              setPage(1);
            }
          }}
          className="w-full border border-line rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-accent bg-white cursor-pointer"
        >
          <option value="">Any Fees</option>
          <option value="100000">Under ₹1 Lakh</option>
          <option value="200000">Under ₹2 Lakhs</option>
          <option value="500000">Under ₹5 Lakhs</option>
          <option value="1000000">Under ₹10 Lakhs</option>
          <option value="2000000">Under ₹20 Lakhs</option>
          <option value="8500000">Under $100k USD</option>
          <option value="custom">✏️ Custom Amount...</option>
        </select>

        {isCustomFee && (
          <form onSubmit={handleCustomFeeApply} className="bg-slate-50 border border-line rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <select
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value)}
                className="px-2 py-1.5 border border-line rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-accent"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="CAD">$ CAD</option>
                <option value="AUD">$ AUD</option>
              </select>

              <input
                type="number"
                value={customAmountInput}
                onChange={(e) => setCustomAmountInput(e.target.value)}
                placeholder="e.g. 350000"
                className="flex-1 px-3 py-1.5 border border-line rounded-lg text-xs bg-white focus:outline-none focus:border-accent"
                min="1"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-primary font-bold text-xs py-2 rounded-lg transition cursor-pointer"
            >
              Apply Custom Fee
            </button>
          </form>
        )}

        {maxFees && (
          <div className="text-[11px] font-mono text-accent font-semibold pt-0.5">
            Active Max Fee: Under ₹{Number(maxFees).toLocaleString("en-IN")}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-line">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => { setVerifiedOnly(!verifiedOnly); setPage(1); }}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${verifiedOnly ? "bg-accent" : "bg-slate-200"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${verifiedOnly ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-slate-700">Verified Only</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => { setScholarshipOnly(!scholarshipOnly); setPage(1); }}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${scholarshipOnly ? "bg-accent" : "bg-slate-200"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${scholarshipOnly ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-slate-700">Has Scholarships</span>
        </label>
      </div>
    </div>
  );

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 py-10 text-left">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Search Colleges &amp; Courses</h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          {loading ? "Searching colleges..." : `${total.toLocaleString()} colleges found worldwide`}
        </p>
      </div>

      {/* Search bar & Mobile Filter button */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search college, course, city, or university..."
            className="w-full pl-10 pr-4 py-3 border border-line rounded-xl text-xs sm:text-sm focus:outline-none focus:border-accent bg-white shadow-xs font-medium"
          />
        </div>
        
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 border border-line rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition shrink-0 cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="w-5 h-5 bg-accent text-primary text-[10px] font-mono font-bold rounded-full grid place-items-center">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Tags */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pt-1">
          {stream && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-lg">
              Stream: {STREAMS.find(s => s.value === stream)?.label || stream}
              <button onClick={() => setStream("")} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {degree && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-lg">
              Degree: {DEGREES.find(d => d.value === degree)?.label || degree}
              <button onClick={() => setDegree("")} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {country && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-lg">
              Country: {countries.find(c => c.code === country)?.name || country}
              <button onClick={() => setCountry("")} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {mode && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-lg">
              Mode: {MODES.find(m => m.value === mode)?.label || mode}
              <button onClick={() => setMode("")} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {collegeType && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-lg">
              Type: {COLLEGE_TYPES.find(t => t.value === collegeType)?.label || collegeType}
              <button onClick={() => setCollegeType("")} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
              Verified Only
              <button onClick={() => setVerifiedOnly(false)} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {scholarshipOnly && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-lg">
              Has Scholarships
              <button onClick={() => setScholarshipOnly(false)} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {maxFees && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-lg">
              Max Fee: Under ₹{Number(maxFees).toLocaleString("en-IN")}
              <button onClick={() => { setMaxFees(""); setIsCustomFee(false); setCustomAmountInput(""); }} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer ml-1">
            Clear All Filters
          </button>
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar Panel */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6 sticky top-24">
          <div className="bg-white border border-line rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" /> Filter Colleges
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            {renderFilterControls()}
          </div>
        </aside>

        {/* Mobile Slide-Over Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden flex justify-end animate-fadeIn">
            <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-line">
                <h3 className="font-bold text-base text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-accent" /> Filter Colleges
                </h3>
                <div className="flex items-center gap-3">
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline">
                      Clear All
                    </button>
                  )}
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-5">
                {renderFilterControls()}
              </div>

              <div className="p-4 border-t border-line bg-slate-50">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-accent hover:bg-accent-hover text-primary font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Show {total.toLocaleString()} Colleges
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-line rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-white border border-line rounded-3xl p-12 text-center my-4 shadow-xs">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-primary mb-1">No Colleges Found</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                No matching institutions found for your active search or filters.
              </p>
              <button onClick={clearFilters} className="text-xs font-bold text-accent hover:underline">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {colleges.map((college: any) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>

              {/* Pagination */}
              {total > 12 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-line rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-mono text-slate-500">
                    Page {page} of {Math.ceil(total / 12)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / 12)}
                    className="px-4 py-2 border border-line rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
