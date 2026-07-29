"use client";

import React, { useState, useEffect } from "react";
import { Database, Plus, CheckCircle2, AlertCircle, Building2, MapPin, Sparkles } from "lucide-react";

interface City {
  id: string;
  name: string;
  state: string;
}

interface Locality {
  id: string;
  name: string;
  cityId: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export default function AdminDatabaseManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [cityForm, setCityForm] = useState({ cityName: "", state: "Karnataka" });
  const [localityForm, setLocalityForm] = useState({ localityName: "", cityId: "" });
  const [amenityForm, setAmenityForm] = useState({ amenityName: "", icon: "Check" });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [citiesRes, localitiesRes, amenitiesRes] = await Promise.all([
        fetch("/api/cities"),
        fetch("/api/localities"),
        fetch("/api/amenities"),
      ]);

      const citiesData = await citiesRes.json();
      const localitiesData = await localitiesRes.json();
      const amenitiesData = await amenitiesRes.json();

      if (citiesData.cities) setCities(citiesData.cities);
      if (localitiesData.localities) setLocalities(localitiesData.localities);
      if (amenitiesData.amenities) setAmenities(amenitiesData.amenities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent, type: "city" | "locality" | "amenity", formData: any) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...formData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create database entry");

      setMessage(`${type.toUpperCase()} created successfully!`);
      
      // Reset forms
      if (type === "city") setCityForm({ cityName: "", state: "Karnataka" });
      if (type === "locality") setLocalityForm({ localityName: "", cityId: "" });
      if (type === "amenity") setAmenityForm({ amenityName: "", icon: "Check" });

      // Reload lists
      loadData();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading database records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
          <Database className="w-6 h-6 text-accent" /> Database Manager
        </h2>
        <p className="text-xs text-slate-500 mt-1">Configure and manage operational parameters such as supported Cities, Localities, and Amenities.</p>
      </div>

      {message && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. CITY MANAGER */}
        <div className="bg-secondary/20 border border-line rounded-xl p-5 space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-accent" /> Cities ({cities.length})
          </h3>
          
          {/* Create form */}
          <form onSubmit={(e) => handleCreate(e, "city", cityForm)} className="space-y-3 text-xs font-semibold text-slate-600">
            <div>
              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">City Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pune"
                value={cityForm.cityName}
                onChange={(e) => setCityForm(prev => ({ ...prev, cityName: e.target.value }))}
                className="w-full border border-line rounded px-2.5 py-1.5 bg-white text-slate-700 font-normal"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">State Name</label>
              <input
                type="text"
                required
                value={cityForm.state}
                onChange={(e) => setCityForm(prev => ({ ...prev, state: e.target.value }))}
                className="w-full border border-line rounded px-2.5 py-1.5 bg-white text-slate-700 font-normal"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-slate-800 text-secondary py-1.5 rounded transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add City
            </button>
          </form>

          {/* List display */}
          <div className="h-40 overflow-y-auto no-scrollbar border border-line bg-white rounded divide-y divide-line/60 text-xs">
            {cities.map(c => (
              <div key={c.id} className="p-2 flex justify-between font-medium">
                <span className="text-primary">{c.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{c.state}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. LOCALITY MANAGER */}
        <div className="bg-secondary/20 border border-line rounded-xl p-5 space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-accent" /> Localities ({localities.length})
          </h3>

          <form onSubmit={(e) => handleCreate(e, "locality", localityForm)} className="space-y-3 text-xs font-semibold text-slate-600">
            <div>
              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Locality Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Koregaon Park"
                value={localityForm.localityName}
                onChange={(e) => setLocalityForm(prev => ({ ...prev, localityName: e.target.value }))}
                className="w-full border border-line rounded px-2.5 py-1.5 bg-white text-slate-700 font-normal"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Associated City</label>
              <select
                required
                value={localityForm.cityId}
                onChange={(e) => setLocalityForm(prev => ({ ...prev, cityId: e.target.value }))}
                className="w-full border border-line rounded px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="">Select City</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-slate-800 text-secondary py-1.5 rounded transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Locality
            </button>
          </form>

          <div className="h-40 overflow-y-auto no-scrollbar border border-line bg-white rounded divide-y divide-line/60 text-xs">
            {localities.map(l => (
              <div key={l.id} className="p-2 flex justify-between font-medium">
                <span className="text-primary">{l.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{l.cityId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. AMENITY MANAGER */}
        <div className="bg-secondary/20 border border-line rounded-xl p-5 space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" /> Amenities ({amenities.length})
          </h3>

          <form onSubmit={(e) => handleCreate(e, "amenity", amenityForm)} className="space-y-3 text-xs font-semibold text-slate-600">
            <div>
              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Amenity Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Swimming Pool"
                value={amenityForm.amenityName}
                onChange={(e) => setAmenityForm(prev => ({ ...prev, amenityName: e.target.value }))}
                className="w-full border border-line rounded px-2.5 py-1.5 bg-white text-slate-700 font-normal"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Lucide Icon Name</label>
              <input
                type="text"
                required
                value={amenityForm.icon}
                onChange={(e) => setAmenityForm(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full border border-line rounded px-2.5 py-1.5 bg-white text-slate-700 font-normal"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-slate-800 text-secondary py-1.5 rounded transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Amenity
            </button>
          </form>

          <div className="h-40 overflow-y-auto no-scrollbar border border-line bg-white rounded divide-y divide-line/60 text-xs">
            {amenities.map(a => (
              <div key={a.id} className="p-2 flex justify-between font-medium">
                <span className="text-primary">{a.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{a.icon}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
