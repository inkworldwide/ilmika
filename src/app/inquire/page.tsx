"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, Building, ShieldCheck, Search, HeadphonesIcon, ClipboardList, MapPin } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const POPULAR_LOCALITIES_MAP: Record<string, string[]> = {
  mumbai: ["Bandra", "Andheri", "Powai", "Juhu", "Worli", "Lower Parel", "Thane"],
  bengaluru: ["Koramangala", "Whitefield", "Indiranagar", "HSR Layout", "Sarjapur Road", "Hebbal", "Bellandur"],
  bangalore: ["Koramangala", "Whitefield", "Indiranagar", "HSR Layout", "Sarjapur Road", "Hebbal", "Bellandur"],
  delhi: ["Connaught Place", "Saket", "Dwarka", "Vasant Kunj", "South Extension", "Rohini"],
  "delhi ncr": ["Connaught Place", "Saket", "Dwarka", "Gurugram Cyber City", "Noida Sec 62"],
  gurugram: ["Cyber City", "Golf Course Road", "DLF Phase 5", "Sohna Road", "Sector 56"],
  gurgaon: ["Cyber City", "Golf Course Road", "DLF Phase 5", "Sohna Road", "Sector 56"],
  hyderabad: ["Gachibowli", "HITECH City", "Jubilee Hills", "Banjara Hills", "Kondapur", "Madhapur"],
  kochi: ["Marine Drive", "Kakkanad", "Edappally", "Vyttila", "Fort Kochi"],
  cochin: ["Marine Drive", "Kakkanad", "Edappally", "Vyttila", "Fort Kochi"],
  pune: ["Koregaon Park", "Baner", "Viman Nagar", "Hinjewadi", "Wakad", "Aundh"],
  chennai: ["OMR", "Velachery", "Anna Nagar", "Adyar", "T. Nagar"],
  noida: ["Sector 62", "Sector 18", "Noida Expressway", "Sector 137"],
  kolkata: ["Salt Lake", "Park Street", "Rajarhat", "New Town"],
  ahmedabad: ["SG Highway", "Satellite", "Prahlad Nagar", "Bodakdev"]
};

function InquireFormContent() {
  const searchParams = useSearchParams();

  const mapPurpose = (param: string) => {
    if (!param) return "";
    const lower = param.toLowerCase().trim();
    if (lower.includes("lease") || lower === "leasing") return "Leasing";
    if (lower.includes("rent") || lower === "renting") return "Renting";
    if (lower.includes("sell") || lower === "selling") return "Selling";
    if (lower.includes("pg") || lower.includes("co-living")) return "PG / Co-living";
    if (lower.includes("buy") || lower.includes("sale") || lower === "buying") return "Buying";
    return "";
  };

  const mapPropertyType = (param: string) => {
    if (!param) return "";
    const lower = param.toLowerCase().trim();
    if (lower.includes("commercial") || lower.includes("office") || lower.includes("shop")) return "Commercial Space";
    if (lower.includes("industrial") || lower.includes("industry")) return "Industrial Building";
    if (lower.includes("land") || lower.includes("plot")) return "Land / Plot";
    if (lower.includes("pg") || lower.includes("co-living")) return "PG / Co-living";
    return "";
  };

  const [purpose, setPurpose] = useState("Buying");
  const [propertyType, setPropertyType] = useState("House / Apartment");
  const [city, setCity] = useState("");
  const [localities, setLocalities] = useState<[string, string, string]>(["", "", ""]);

  // Read URL params on mount (client-side only) — this is the primary mechanism
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purposeVal = urlParams.get("purpose") || urlParams.get("purposeParam") || urlParams.get("tx") || urlParams.get("transactionType") || "";
    const categoryVal = urlParams.get("category") || urlParams.get("propertyType") || "";
    
    const mapped = mapPurpose(purposeVal);
    if (mapped) setPurpose(mapped);
    
    const mappedCat = mapPropertyType(categoryVal);
    if (mappedCat) setPropertyType(mappedCat);
  }, []);

  // Also react to searchParams changes for in-app navigation
  useEffect(() => {
    const purposeVal = searchParams.get("purpose") || searchParams.get("purposeParam") || searchParams.get("tx") || searchParams.get("transactionType") || "";
    const mapped = mapPurpose(purposeVal);
    if (mapped) setPurpose(mapped);

    const categoryVal = searchParams.get("category") || searchParams.get("propertyType") || "";
    const mappedCat = mapPropertyType(categoryVal);
    if (mappedCat) setPropertyType(mappedCat);
  }, [searchParams]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  const [budgetRange, setBudgetRange] = useState("Under ₹50 Lacs");
  const [customBudget, setCustomBudget] = useState("");
  const [showCustomLocalityInput, setShowCustomLocalityInput] = useState(false);
  const [customLocalityInput, setCustomLocalityInput] = useState("");

  const handleLocalityChange = (index: number, value: string) => {
    const next = [...localities] as [string, string, string];
    next[index] = value;
    setLocalities(next);
  };

  const handleChipClick = (localityName: string) => {
    if (localities.includes(localityName)) {
      const next = localities.map(l => l === localityName ? "" : l) as [string, string, string];
      setLocalities(next);
      return;
    }
    const emptyIndex = localities.findIndex(l => !l.trim());
    if (emptyIndex !== -1) {
      handleLocalityChange(emptyIndex, localityName);
    } else {
      handleLocalityChange(2, localityName);
    }
  };

  const handleAddCustomLocalitySubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const val = customLocalityInput.trim();
    if (!val) return;

    if (localities.includes(val)) {
      setCustomLocalityInput("");
      setShowCustomLocalityInput(false);
      return;
    }

    const emptyIndex = localities.findIndex(l => !l.trim());
    if (emptyIndex !== -1) {
      handleLocalityChange(emptyIndex, val);
    } else {
      handleLocalityChange(2, val);
    }

    setCustomLocalityInput("");
    setShowCustomLocalityInput(false);
  };

  const getMatchingLocalities = (cityName: string) => {
    const clean = cityName.toLowerCase().trim();
    if (!clean) return [];
    for (const [key, locs] of Object.entries(POPULAR_LOCALITIES_MAP)) {
      if (clean.includes(key) || key.includes(clean)) {
        return locs;
      }
    }
    return [];
  };

  const matchingLocalities = getMatchingLocalities(city);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const finalBudget = budgetRange === "Other" ? (customBudget.trim() || "Custom Budget") : budgetRange;
    const activeLocalities = localities.filter(l => l.trim().length > 0).join(", ");

    const data = {
      type: "Inquiry",
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      purpose: formData.get("purpose"),
      propertyType: formData.get("propertyType"),
      city: city.trim(),
      localities: activeLocalities,
      budget: finalBudget,
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit inquiry");
      
      setStatus("success");
      form.reset();
      setCity("");
      setLocalities(["", "", ""]);
      setBudgetRange("Under ₹50 Lacs");
      setCustomBudget("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Column - Form */}
      <div className="lg:col-span-8 bg-white rounded-[2rem] border border-line shadow-[0_20px_50px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent"></div>
        
        <form className="p-8 md:p-12" onSubmit={handleSubmit}>
          {status === "success" && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              Your inquiry has been successfully sent to our team!
            </div>
          )}
          {status === "error" && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {errorMessage}
            </div>
          )}
          {/* Section 1 */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-2xl font-bold text-primary font-serif">Personal Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <input required name="name" type="text" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="John Doe" />
              </div>
              <div className="space-y-2 relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                <input required name="phone" type="tel" maxLength={10} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10); }} className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="9876543210" />
              </div>
              <div className="space-y-2 md:col-span-2 relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <input required name="email" type="email" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="john@example.com" />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-line/60 mb-12"></div>

          {/* Section 2 */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-2xl font-bold text-primary font-serif">Property Requirements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Purpose</label>
                <select 
                  name="purpose" 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="Buying">Buying</option>
                  <option value="Renting">Renting</option>
                  <option value="Leasing">Leasing</option>
                  <option value="Selling">Selling</option>
                  <option value="PG / Co-living">PG / Co-living</option>
                </select>
              </div>
              <div className="space-y-2 relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Property Type</label>
                <select 
                  name="propertyType" 
                  value={propertyType} 
                  onChange={(e) => setPropertyType(e.target.value)} 
                  className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="House / Apartment">House / Apartment</option>
                  <option value="Commercial Space">Commercial Space</option>
                  <option value="Industrial Building">Industrial Building</option>
                  <option value="Land / Plot">Land / Plot</option>
                  <option value="PG / Co-living">PG / Co-living</option>
                </select>
              </div>
              <div className="space-y-2 relative group md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Preferred City</label>
                <input 
                  required 
                  name="city" 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50 text-slate-800 font-medium" 
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR, Kochi..." 
                />
              </div>

              {/* Dynamic Top 3 Preferred Localities */}
              {city.trim().length > 0 && (
                <div className="md:col-span-2 space-y-4 bg-slate-50/90 p-5 rounded-2xl border border-line/80 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-accent" />
                      Top 3 Preferred Localities / Areas in {city}
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Click suggestions or type custom areas</span>
                  </div>

                  {/* Popular Locality Chips + Custom Locality Plus Chip */}
                  {(matchingLocalities.length > 0 || localities.some(l => l.trim().length > 0)) && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Popular in {city}:</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {matchingLocalities.map((loc) => {
                          const isSelected = localities.includes(loc);
                          return (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => handleChipClick(loc)}
                              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                isSelected 
                                  ? 'bg-accent/15 border-accent text-accent font-bold shadow-xs' 
                                  : 'bg-white border-line/80 text-slate-600 hover:border-accent/40 hover:text-accent'
                              }`}
                            >
                              <span>{isSelected ? "✓" : "+"}</span>
                              <span>{loc}</span>
                            </button>
                          );
                        })}

                        {/* Custom user-added localities not in predefined list */}
                        {localities
                          .filter(loc => loc.trim().length > 0 && !matchingLocalities.includes(loc.trim()))
                          .map((loc, idx) => (
                            <button
                              key={`custom-${idx}-${loc}`}
                              type="button"
                              onClick={() => handleChipClick(loc)}
                              className="text-xs px-3 py-1.5 rounded-xl border border-accent bg-accent/15 text-accent font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                              title="Click to remove"
                            >
                              <span>✓</span>
                              <span>{loc}</span>
                              <span className="text-[10px] ml-0.5 opacity-70 hover:opacity-100">✕</span>
                            </button>
                          ))
                        }

                        {/* Plus icon / Add Other Locality chip */}
                        {showCustomLocalityInput ? (
                          <div className="flex items-center gap-1 bg-white border border-accent/80 rounded-xl px-2.5 py-1 shadow-xs animate-fadeIn">
                            <input
                              type="text"
                              autoFocus
                              value={customLocalityInput}
                              onChange={(e) => setCustomLocalityInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomLocalitySubmit();
                                }
                              }}
                              placeholder="Type custom locality..."
                              className="text-xs px-1 py-0.5 outline-none w-36 text-slate-800 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomLocalitySubmit()}
                              className="text-xs bg-accent text-primary px-2.5 py-1 rounded-lg font-bold hover:bg-accent/90 cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCustomLocalityInput(false)}
                              className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowCustomLocalityInput(true)}
                            className="text-xs px-3 py-1.5 rounded-xl border border-dashed border-accent/60 text-accent font-semibold bg-accent/5 hover:bg-accent/20 transition cursor-pointer flex items-center gap-1.5"
                            title="Add another custom locality"
                          >
                            <span className="font-bold text-sm">+</span>
                            <span>Other Locality</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3 Locality Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={localities[idx]}
                          onChange={(e) => handleLocalityChange(idx, e.target.value)}
                          placeholder={idx === 0 ? "Locality 1 (e.g. Bandra)" : idx === 1 ? "Locality 2 (Optional)" : "Locality 3 (Optional)"}
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-line/80 focus:border-accent outline-none bg-white text-xs text-slate-800 transition shadow-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 relative group md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Budget Range</label>
                <select 
                  name="budget" 
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="Under ₹50 Lacs">Under ₹50 Lacs</option>
                  <option value="₹50 Lacs - ₹1 Cr">₹50 Lacs - ₹1 Cr</option>
                  <option value="₹1 Cr - ₹5 Cr">₹1 Cr - ₹5 Cr</option>
                  <option value="Above ₹5 Cr">Above ₹5 Cr</option>
                  <option value="Other">Other (Custom Budget)...</option>
                </select>

                {budgetRange === "Other" && (
                  <div className="mt-2.5 animate-fadeIn">
                    <input 
                      type="text"
                      required
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="Type your budget (e.g. ₹25,000/mo or ₹85 Lacs)"
                      className="w-full px-5 py-3.5 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-white text-slate-800 text-sm placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2 relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Additional Requirements</label>
                <textarea name="message" rows={4} className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50 resize-none" placeholder="Describe any specific needs, amenities, or timelines..."></textarea>
              </div>
            </div>
          </div>

          <button disabled={status === "loading"} type="submit" className="w-full bg-accent text-primary font-bold py-5 rounded-xl hover:bg-accent/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group text-lg disabled:opacity-70">
            <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> 
            <span>{status === "loading" ? "Submitting..." : "Submit Inquiry"}</span>
          </button>
        </form>
      </div>

      {/* Right Column - Info */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
        <div className="bg-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="font-serif text-2xl font-bold mb-2">Why Inquire?</h3>
          <p className="text-slate-300 mb-8 leading-relaxed">Our premium concierge service helps you skip the scrolling and get directly to properties that matter.</p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Tailored Matches</h4>
                <p className="text-sm text-slate-400">Get properties that exactly match your criteria.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Verified Listings</h4>
                <p className="text-sm text-slate-400">100% verified properties and owners.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <HeadphonesIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Expert Advice</h4>
                <p className="text-sm text-slate-400">Dedicated relationship manager for guidance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-line flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-accent" />
          </div>
          <h4 className="font-bold text-primary text-xl mb-2">Are you a property owner?</h4>
          <p className="text-slate-500 mb-6 text-sm">List your property with us and reach thousands of verified buyers and tenants.</p>
          {authLoading ? (
            <div className="w-full text-center py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-400 font-bold">
              Loading...
            </div>
          ) : user ? (
            <Link href="/properties/add" className="w-full block text-center py-3 px-6 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
              List Property Free
            </Link>
          ) : (
            <Link href="/auth/login" className="w-full block text-center py-3 px-6 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
              Login to List Property
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InquirePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-5">
          {/* Header Area */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold mb-6 uppercase tracking-widest">
              <Search className="w-4 h-4" />
              Property Inquiry
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              Let our experts find your <span className="text-accent italic">perfect</span> match.
            </h1>
            <p className="text-lg text-slate-500">
              Tell us exactly what you're looking for, and our dedicated team will handpick the best options that meet your unique requirements.
            </p>
          </div>

          <Suspense fallback={<div className="p-8 text-center text-slate-400 font-semibold">Loading inquiry form...</div>}>
            <InquireFormContent />
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
