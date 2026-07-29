"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X, ArrowLeft, Building, Trash2, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get("ids") || "";

  useEffect(() => {
    if (!idsParam.trim()) {
      setProperties([]);
      setLoading(false);
      return;
    }

    async function loadProperties() {
      setLoading(true);
      try {
        const res = await fetch(`/api/properties/compare?ids=${idsParam}`);
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties);
        }
      } catch (err) {
        console.error("Comparison load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [idsParam]);

  const handleRemove = (id: string) => {
    const idList = idsParam.split(",").filter(x => x && x !== id);
    if (idList.length === 0) {
      router.push("/properties");
    } else {
      router.push(`/properties/compare?ids=${idList.join(",")}`);
    }
  };

  const formatPrice = (price: number, type: string) => {
    const val = price >= 10000000 
      ? `₹${(price / 10000000).toFixed(2)} Crore` 
      : price >= 100000 
      ? `₹${(price / 100000).toFixed(2)} Lakh` 
      : `₹${price.toLocaleString("en-IN")}`;
    return `${val}${type === "RENT" ? "/mo" : ""}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono mt-2">Loading comparison details...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center px-6">
        <Building className="w-12 h-12 text-accent mb-4" />
        <h2 className="font-serif text-xl font-semibold text-primary">No Properties Selected</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Shortlist or select properties from the search listings page to compare their specs side-by-side.
        </p>
        <Link 
          href="/properties" 
          className="mt-6 bg-primary text-secondary font-bold text-xs px-6 py-2.5 rounded-full hover:bg-slate-800 transition"
        >
          Explore Listings
        </Link>
      </div>
    );
  }

  // Get a unique list of all amenity names across compared properties
  const allAmenityNames = Array.from(
    new Set(
      properties.flatMap(p => p.amenities?.map((a: any) => a.amenity.name) || [])
    )
  ).sort();

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 py-10 text-left">
      <div className="flex items-center gap-2 mb-6">
        <Link 
          href="/properties" 
          className="w-8 h-8 border border-line rounded-full grid place-items-center hover:bg-secondary transition text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">Property Comparison</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comparing {properties.length} properties side-by-side.</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-line rounded-2xl bg-white shadow-sm no-scrollbar">
        <table className="w-full border-collapse min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-line bg-secondary/35">
              <th className="p-4 w-52 text-left font-serif font-bold text-primary border-r border-line bg-white sticky left-0 z-10">
                Specifications
              </th>
              {properties.map(p => {
                const cover = p.images?.[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";
                return (
                  <th key={p.id} className="p-4 min-w-[200px] text-left align-top font-semibold border-r border-line last:border-r-0">
                    <div className="relative group rounded-xl overflow-hidden aspect-[4/3] mb-3 border border-line">
                      <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 text-red-500 hover:text-red-700 grid place-items-center cursor-pointer shadow transition"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Link href={`/properties/${p.id}`} className="font-serif font-bold text-sm text-primary hover:underline hover:text-accent line-clamp-2">
                      {p.title}
                    </Link>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wide">
                      For {p.transactionType} · {p.propertyType.replace("_", " ")}
                    </p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 font-medium text-slate-700">
            {/* Price */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Price</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0 font-mono font-bold text-accent text-sm">
                  {formatPrice(p.price, p.transactionType)}
                </td>
              ))}
            </tr>
            {/* Location */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Location</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0">
                  {p.locality.name}, {p.city.name}
                </td>
              ))}
            </tr>
            {/* BHK Config */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Configuration</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0 font-semibold">
                  {p.bhk ? `${p.bhk} BHK` : "N/A"}
                </td>
              ))}
            </tr>
            {/* Bedrooms & Bathrooms */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Bedrooms / Baths</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0">
                  {p.bedrooms || 0} Beds / {p.bathrooms || 0} Baths
                </td>
              ))}
            </tr>
            {/* Carpet Area */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Carpet Area</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0 font-mono">
                  {p.carpetArea} {p.areaUnit}
                </td>
              ))}
            </tr>
            {/* Furnishing */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Furnishing</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0 capitalize">
                  {p.furnishingStatus.replace("_", " ").toLowerCase()}
                </td>
              ))}
            </tr>
            {/* Facing */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Facing Direction</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0 capitalize">
                  {p.facing ? p.facing.toLowerCase() : "N/A"}
                </td>
              ))}
            </tr>
            {/* Floor Details */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Floor Details</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0">
                  {p.floor !== null ? `Floor ${p.floor}` : "N/A"} {p.totalFloors ? `of ${p.totalFloors}` : ""}
                </td>
              ))}
            </tr>
            {/* Age of Property */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Property Age</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0 font-mono">
                  {p.propertyAge !== null ? `${p.propertyAge} Years` : "N/A"}
                </td>
              ))}
            </tr>
            {/* Parking details */}
            <tr>
              <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">Parking Space</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 border-r border-line last:border-r-0">
                  {p.coveredParking || 0} Covered, {p.openParking || 0} Open
                </td>
              ))}
            </tr>

            {/* AMENITIES HEADER */}
            <tr className="bg-secondary/20">
              <td colSpan={properties.length + 1} className="p-3 font-serif font-bold text-primary text-center">
                Amenities &amp; Features
              </td>
            </tr>

            {/* List all individual amenities checkmarks */}
            {allAmenityNames.map(amenityName => (
              <tr key={amenityName}>
                <td className="p-4 font-bold text-primary border-r border-line bg-white sticky left-0 z-10">{amenityName}</td>
                {properties.map(p => {
                  const hasAmenity = p.amenities?.some((a: any) => a.amenity.name === amenityName);
                  return (
                    <td key={p.id} className="p-4 border-r border-line last:border-r-0 text-center">
                      {hasAmenity ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <CompareContent />
      </Suspense>
      <Footer />
    </div>
  );
}
