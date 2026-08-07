"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Database,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  Building,
  Search,
  Trash2,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  RefreshCw,
  LayoutGrid,
} from "lucide-react";

interface City {
  id: string;
  name: string;
  state?: string;
  country?: { name: string };
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string | null;
}

interface Facility {
  id: string;
  name: string;
  icon: string;
}

export default function AdminDatabaseManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab & View state
  const [activeTab, setActiveTab] = useState<"overview" | "cities" | "countries" | "facilities">("overview");

  // Search states
  const [globalSearch, setGlobalSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");

  // Form states
  const [cityForm, setCityForm] = useState({ cityName: "", state: "Karnataka" });
  const [countryForm, setCountryForm] = useState({ countryName: "", countryCode: "", flag: "🌍" });
  const [facilityForm, setFacilityForm] = useState({ facilityName: "", icon: "Building" });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToastNotice = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [citiesRes, countriesRes, amenitiesRes] = await Promise.all([
        fetch("/api/cities"),
        fetch("/api/localities"),
        fetch("/api/amenities"),
      ]);

      const citiesData = await citiesRes.json();
      const countriesData = await countriesRes.json();
      const amenitiesData = await amenitiesRes.json();

      if (citiesData.cities) setCities(citiesData.cities);
      if (countriesData.countries) setCountries(countriesData.countries);
      if (amenitiesData.amenities || amenitiesData.facilities) {
        setFacilities(amenitiesData.facilities || amenitiesData.amenities || []);
      }
    } catch (err) {
      console.error(err);
      showToastNotice("Failed to load master configuration data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent, type: "city" | "country" | "facility", formData: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...formData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create database entry");

      showToastNotice(`✓ ${type.toUpperCase()} created successfully!`);
      
      // Reset forms
      if (type === "city") setCityForm({ cityName: "", state: "Karnataka" });
      if (type === "country") setCountryForm({ countryName: "", countryCode: "", flag: "🌍" });
      if (type === "facility") setFacilityForm({ facilityName: "", icon: "Building" });

      // Reload lists
      loadData();
    } catch (err: any) {
      showToastNotice(err.message || "An error occurred.", "error");
    }
  };

  const handleDelete = async (type: "city" | "country" | "facility", id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/database?id=${id}&type=${type}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry.");

      showToastNotice(`✓ ${type.toUpperCase()} '${name}' deleted successfully!`);
      loadData();
    } catch (err: any) {
      showToastNotice(err.message || "Failed to delete entry.", "error");
    }
  };

  // Filtered lists
  const filteredCities = useMemo(() => {
    const q = (citySearch || globalSearch).toLowerCase().trim();
    if (!q) return cities;
    return cities.filter(c => c.name.toLowerCase().includes(q) || (c.state || "").toLowerCase().includes(q));
  }, [cities, citySearch, globalSearch]);

  const filteredCountries = useMemo(() => {
    const q = (countrySearch || globalSearch).toLowerCase().trim();
    if (!q) return countries;
    return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countries, countrySearch, globalSearch]);

  const filteredFacilities = useMemo(() => {
    const q = (facilitySearch || globalSearch).toLowerCase().trim();
    if (!q) return facilities;
    return facilities.filter(f => f.name.toLowerCase().includes(q));
  }, [facilities, facilitySearch, globalSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
        <div className="w-9 h-9 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Synchronizing platform master configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-10 relative">

      {/* Floating Toast Notice */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white transition animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-[#0F172A] border border-[#D4AF37]/50"
              : "bg-red-900 border border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb Navigation & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#D4AF37] font-semibold">Platform Configuration</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight flex items-center gap-2.5">
            <Database className="w-7 h-7 text-[#D4AF37]" /> Platform Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Configure and manage the platform's master operational data including countries, cities, facilities, and regional settings.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E5E7EB] font-bold px-3.5 py-2 rounded-xl text-xs transition duration-200 shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Master Data
        </button>
      </div>

      {/* 📊 Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("countries")}
          className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex items-center justify-between ${
            activeTab === "countries" ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5E7EB]"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Study Destinations
            </p>
            <p className="font-serif text-3xl font-bold text-[#0F172A]">{countries.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Global countries active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 grid place-items-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("cities")}
          className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex items-center justify-between ${
            activeTab === "cities" ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5E7EB]"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Academic Hubs
            </p>
            <p className="font-serif text-3xl font-bold text-[#0F172A]">{cities.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Metropolitan cities listed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4AF37] border border-amber-100 grid place-items-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("facilities")}
          className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex items-center justify-between ${
            activeTab === "facilities" ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5E7EB]"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Campus Infrastructure
            </p>
            <p className="font-serif text-3xl font-bold text-[#0F172A]">{facilities.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Facilities & amenities</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 grid place-items-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Segmented View Tabs & Global Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Overview Cards</span>
          </button>

          <button
            onClick={() => setActiveTab("countries")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "countries"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Countries</span>
            <span className="ml-1 text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
              {countries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("cities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "cities"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cities</span>
            <span className="ml-1 text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
              {cities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("facilities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "facilities"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Facilities</span>
            <span className="ml-1 text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
              {facilities.length}
            </span>
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all master data..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37] transition"
          />
        </div>
      </div>

      {/* 3-COLUMN OVERVIEW GRID VIEW */}
      {(activeTab === "overview" || activeTab === "cities" || activeTab === "countries" || activeTab === "facilities") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 🏙 1. CITIES MANAGER */}
          {(activeTab === "overview" || activeTab === "cities") && (
            <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
              activeTab === "cities" ? "lg:col-span-3" : ""
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" /> Academic Cities
                  </h3>
                  <span className="bg-amber-50 text-[#D4AF37] border border-amber-200/60 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {filteredCities.length} Total
                  </span>
                </div>
                
                {/* Create form */}
                <form onSubmit={(e) => handleCreate(e, "city", cityForm)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">City Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bengaluru, London, Munich"
                        value={cityForm.cityName}
                        onChange={(e) => setCityForm(prev => ({ ...prev, cityName: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">State / Region Name</label>
                      <input
                        type="text"
                        required
                        value={cityForm.state}
                        onChange={(e) => setCityForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add City
                  </button>
                </form>

                {/* Search Input */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                {/* List display */}
                <div className="h-56 overflow-y-auto custom-scrollbar border border-[#E5E7EB] bg-slate-50/50 rounded-xl divide-y divide-slate-100 text-xs">
                  {filteredCities.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">No matching cities found</div>
                  ) : (
                    filteredCities.map((c, idx) => (
                      <div key={c.id || `city-${idx}`} className="group p-2.5 flex items-center justify-between font-medium hover:bg-white transition">
                        <span className="text-[#0F172A] font-semibold">{c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{c.state || "Active"}</span>
                          <button
                            onClick={() => handleDelete("city", c.id, c.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete City"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🌍 2. COUNTRIES MANAGER */}
          {(activeTab === "overview" || activeTab === "countries") && (
            <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
              activeTab === "countries" ? "lg:col-span-3" : ""
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#D4AF37]" /> Study Destinations
                  </h3>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {filteredCountries.length} Total
                  </span>
                </div>

                <form onSubmit={(e) => handleCreate(e, "country", countryForm)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Country Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Japan, Germany"
                        value={countryForm.countryName}
                        onChange={(e) => setCountryForm(prev => ({ ...prev, countryName: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">2-Letter ISO Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. JP, DE"
                        value={countryForm.countryCode}
                        onChange={(e) => setCountryForm(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Country
                  </button>
                </form>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                <div className="h-56 overflow-y-auto custom-scrollbar border border-[#E5E7EB] bg-slate-50/50 rounded-xl divide-y divide-slate-100 text-xs">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">No matching countries found</div>
                  ) : (
                    filteredCountries.map((c, idx) => (
                      <div key={c.id || `country-${idx}`} className="group p-2.5 flex items-center justify-between font-medium hover:bg-white transition">
                        <span className="text-[#0F172A] flex items-center gap-2 font-semibold">
                          <span className="text-base">{c.flag || "🌍"}</span>
                          <span>{c.name}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{c.code}</span>
                          <button
                            onClick={() => handleDelete("country", c.id, c.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete Country"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🏢 3. FACILITIES MANAGER */}
          {(activeTab === "overview" || activeTab === "facilities") && (
            <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
              activeTab === "facilities" ? "lg:col-span-3" : ""
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#D4AF37]" /> Facilities
                  </h3>
                  <span className="bg-teal-50 text-teal-700 border border-teal-200/60 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {filteredFacilities.length} Total
                  </span>
                </div>

                <form onSubmit={(e) => handleCreate(e, "facility", facilityForm)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Facility Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AI Research Center"
                        value={facilityForm.facilityName}
                        onChange={(e) => setFacilityForm(prev => ({ ...prev, facilityName: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Icon Category</label>
                      <input
                        type="text"
                        required
                        value={facilityForm.icon}
                        onChange={(e) => setFacilityForm(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Facility
                  </button>
                </form>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Facilities..."
                    value={facilitySearch}
                    onChange={(e) => setFacilitySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                <div className="h-56 overflow-y-auto custom-scrollbar border border-[#E5E7EB] bg-slate-50/50 rounded-xl divide-y divide-slate-100 text-xs">
                  {filteredFacilities.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">No matching facilities found</div>
                  ) : (
                    filteredFacilities.map((f, idx) => (
                      <div key={f.id || `facility-${idx}`} className="group p-2.5 flex items-center justify-between font-medium hover:bg-white transition">
                        <span className="text-[#0F172A] font-semibold">{f.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{f.icon || "Building"}</span>
                          <button
                            onClick={() => handleDelete("facility", f.id, f.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete Facility"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
