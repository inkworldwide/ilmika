"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, FileText, Building2, UserCheck, Home, Briefcase, MapPin, Compass } from "lucide-react";
import { usePathname } from "next/navigation";

const SHARED_CATEGORIES = [
  {
    name: "Houses",
    categoryParam: "homes",
    types: [
      { name: "Residential Flat", typeParam: "APARTMENT", hasBhk: true },
      { name: "Independent Residential Flat", typeParam: "BUILDER_FLOOR", hasBhk: true },
      { name: "Bungalow", typeParam: "INDEPENDENT_HOUSE", hasBhk: true },
      { name: "Villas", typeParam: "VILLA", hasBhk: true },
      { name: "Studio Apartment", typeParam: "STUDIO_APARTMENT", hasBhk: false },
    ]
  },
  {
    name: "Lands",
    categoryParam: "land",
    types: [
      { name: "Developer Sites", typeParam: "DEVELOPER_SITE", hasBhk: false },
      { name: "Plots", typeParam: "PLOT", hasBhk: false },
      { name: "Agriculture Land", typeParam: "AGRICULTURE_LAND", hasBhk: false },
      { name: "Resort", typeParam: "RESORT", hasBhk: false },
    ]
  },
  {
    name: "Industrial",
    categoryParam: "industry",
    types: [
      { name: "Industrial Site", typeParam: "INDUSTRIAL_SITE", hasBhk: false },
      { name: "Industrial Building", typeParam: "INDUSTRIAL_BUILDING", hasBhk: false },
    ]
  },
  {
    name: "Commercial",
    categoryParam: "commercial",
    types: [
      { name: "Hotel", typeParam: "HOTEL", hasBhk: false },
      { name: "Complex", typeParam: "COMMERCIAL_COMPLEX", hasBhk: false },
      { name: "Shops", typeParam: "SHOP", hasBhk: false },
      { name: "Land", typeParam: "COMMERCIAL_LAND", hasBhk: false },
    ]
  }
];

export const SERVICES_DATA = [
  {
    name: "Buying",
    href: "/properties?transactionType=SALE",
    txParam: "SALE",
    hasAvailableRequired: true,
    categories: SHARED_CATEGORIES
  },
  {
    name: "Selling",
    href: "/properties?transactionType=SALE",
    txParam: "SALE",
    hasAvailableRequired: true,
    categories: SHARED_CATEGORIES
  },
  {
    name: "Renting",
    href: "/properties?transactionType=RENT",
    txParam: "RENT",
    hasAvailableRequired: true,
    categories: SHARED_CATEGORIES
  },
  {
    name: "Leasing",
    href: "/properties?transactionType=LEASE",
    txParam: "LEASE",
    hasAvailableRequired: true,
    categories: SHARED_CATEGORIES
  },
  {
    name: "PG/Co-living",
    href: "/properties?propertyType=PG",
    txParam: "RENT",
    hasAvailableRequired: true,
    categories: [
      {
        name: "Houses",
        categoryParam: "homes",
        types: [
          { name: "Residential Flat", typeParam: "APARTMENT", hasBhk: true },
          { name: "Independent Residential Flat", typeParam: "BUILDER_FLOOR", hasBhk: true },
          { name: "Bungalow", typeParam: "INDEPENDENT_HOUSE", hasBhk: true },
          { name: "Villas", typeParam: "VILLA", hasBhk: true },
          { name: "Studio Apartment", typeParam: "STUDIO_APARTMENT", hasBhk: false },
        ]
      }
    ]
  }
];

const CategoryList = ({ categories, txParam }: { categories: any[], txParam?: string }) => {
  return (
    <>
      {categories.map((cat, idx) => (
        <div key={idx} className="mb-6">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-1.5 border-b border-line pb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            {cat.name}
          </h4>
          <ul className="space-y-3 pl-3 pt-2">
            {cat.types.map((type: any, tIdx: number) => {
              const baseHref = `/properties?category=${cat.categoryParam}&propertyType=${type.typeParam}${txParam ? `&transactionType=${txParam}` : ""}`;
              return (
                <li key={tIdx} className="text-slate-600 text-[13px]">
                  <Link href={baseHref} className="hover:text-accent transition block font-medium">
                    {type.name}
                  </Link>
                  {type.hasBhk && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[1, 2, 3, 4].map(bhk => (
                        <Link 
                          key={bhk} 
                          href={`${baseHref}&bhk=${bhk}`} 
                          className="text-[10px] bg-paper hover:bg-accent/10 border border-line px-1.5 py-0.5 rounded text-slate-500 hover:text-accent transition"
                        >
                          {bhk}BHK{bhk === 4 ? '+' : ''}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
};

export default function NavMenu() {
  const [activeService, setActiveService] = useState<string>("Buying");
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search.toLowerCase();
      if (search.includes("lease")) setActiveService("Leasing");
      else if (search.includes("rent")) setActiveService("Renting");
      else if (search.includes("pg")) setActiveService("PG/Co-living");
      else if (search.includes("sale")) setActiveService("Buying");
    }
  }, [pathname]);
  
  return (
    <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-primary/80">
      <Link href="/" className={`hover:text-primary transition ${pathname === "/" ? "text-accent font-bold" : ""}`}>
        Home
      </Link>
      
      {/* Services Mega Menu */}
      <div className="relative group h-20 flex items-center">
        <span className="hover:text-primary transition cursor-pointer flex items-center gap-1">
          Services <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        </span>
        
        {/* Dropdown Container */}
        <div className="absolute top-[79px] -left-32 bg-white border border-line shadow-2xl rounded-b-xl w-[900px] hidden group-hover:flex z-[100] text-sm overflow-hidden min-h-[500px]">
          
          {/* Main Services Column */}
          <div className="w-[220px] bg-paper border-r border-line py-4 shrink-0">
            {SERVICES_DATA.map((service) => (
              <Link 
                href={service.href}
                key={service.name}
                onMouseEnter={() => setActiveService(service.name)}
                className={`px-6 py-4 cursor-pointer flex items-center justify-between transition-colors ${activeService === service.name ? 'bg-white text-accent font-bold border-l-4 border-accent shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]' : 'hover:bg-white/50 text-primary'}`}
              >
                {service.name}
                <ChevronRight className={`w-4 h-4 transition-opacity ${activeService === service.name ? 'opacity-100 text-accent' : 'opacity-30'}`} />
              </Link>
            ))}
          </div>

          {/* Sub-categories Column */}
          <div className="flex-1 p-8 bg-white overflow-y-auto max-h-[70vh] custom-scrollbar">
            {activeService && SERVICES_DATA.find(s => s.name === activeService)?.hasAvailableRequired ? (
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h3 className="font-bold text-accent text-sm uppercase tracking-wider mb-6 border-b-2 border-accent/30 pb-2 inline-flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" /> Available Verified Listings
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <CategoryList 
                      categories={SERVICES_DATA.find(s => s.name === activeService)?.categories || []} 
                      txParam={SERVICES_DATA.find(s => s.name === activeService)?.txParam} 
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-accent text-sm uppercase tracking-wider mb-6 border-b-2 border-accent/30 pb-2 inline-flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-accent" /> Seeker Demands & Custom Requests
                  </h3>
                  
                  {/* Seeker Requirement CTA Card */}
                  <div className="bg-gradient-to-br from-slate-950 via-[#0B132B] to-[#060C1B] text-white rounded-2xl p-5 border border-slate-800 space-y-3.5 mb-6 shadow-md relative overflow-hidden group">
                    <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Custom Property Acquisition</span>
                    </div>
                    
                    <h4 className="font-serif text-base font-bold text-white leading-snug">
                      Can't Find Your Ideal Match?
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Specify your preferred location, budget, and requirements. Get matched directly with verified owners and licensed proptech agents.
                    </p>

                    <Link 
                      href={`/inquire?purpose=${encodeURIComponent(activeService)}`} 
                      className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer hover:translate-x-0.5 transform"
                    >
                      <span>Post Custom Requirement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Categorized Seeker Options */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-line pb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        Residential Property Requests
                      </h4>
                      <ul className="space-y-2.5 pl-3 text-xs text-slate-600">
                        <li>
                          <Link href={`/inquire?category=residential&purpose=${encodeURIComponent(activeService)}`} className="hover:text-accent font-medium transition flex items-center gap-2 group">
                            <Home className="w-3.5 h-3.5 text-accent transition-transform group-hover:scale-110" />
                            <span>Flats & Apartments Wanted</span>
                          </Link>
                        </li>
                        <li>
                          <Link href={`/inquire?category=villa&purpose=${encodeURIComponent(activeService)}`} className="hover:text-accent font-medium transition flex items-center gap-2 group">
                            <Home className="w-3.5 h-3.5 text-accent transition-transform group-hover:scale-110" />
                            <span>Villas & Luxury Homes Wanted</span>
                          </Link>
                        </li>
                        <li>
                          <Link href={`/inquire?category=studio&purpose=${encodeURIComponent(activeService)}`} className="hover:text-accent font-medium transition flex items-center gap-2 group">
                            <Home className="w-3.5 h-3.5 text-accent transition-transform group-hover:scale-110" />
                            <span>Studio Apartments Wanted</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-line pb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        Commercial & Land Acquisition
                      </h4>
                      <ul className="space-y-2.5 pl-3 text-xs text-slate-600">
                        <li>
                          <Link href={`/inquire?category=commercial&purpose=${encodeURIComponent(activeService)}`} className="hover:text-accent font-medium transition flex items-center gap-2 group">
                            <Briefcase className="w-3.5 h-3.5 text-accent transition-transform group-hover:scale-110" />
                            <span>Commercial Offices & Shops Demands</span>
                          </Link>
                        </li>
                        <li>
                          <Link href={`/inquire?category=pg&purpose=${encodeURIComponent(activeService)}`} className="hover:text-accent font-medium transition flex items-center gap-2 group">
                            <Building2 className="w-3.5 h-3.5 text-accent transition-transform group-hover:scale-110" />
                            <span>PG & Co-Living Spaces Wanted</span>
                          </Link>
                        </li>
                        <li>
                          <Link href={`/inquire?category=land&purpose=${encodeURIComponent(activeService)}`} className="hover:text-accent font-medium transition flex items-center gap-2 group">
                            <MapPin className="w-3.5 h-3.5 text-accent transition-transform group-hover:scale-110" />
                            <span>Land & Plot Acquisition Requests</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-accent text-lg mb-6 border-b-2 border-accent/20 pb-2 inline-block">{activeService} Options</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <CategoryList 
                    categories={SERVICES_DATA.find(s => s.name === activeService)?.categories || []} 
                    txParam={SERVICES_DATA.find(s => s.name === activeService)?.txParam} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href="/about" className={`hover:text-primary transition ${pathname === "/about" ? "text-accent font-bold" : ""}`}>
        About Us
      </Link>
      <Link href="/contact" className={`hover:text-primary transition ${pathname === "/contact" ? "text-accent font-bold" : ""}`}>
        Contact
      </Link>
      <Link href="/inquire" className={`hover:text-primary transition ${pathname === "/inquire" ? "text-accent font-bold" : ""}`}>
        Inquire
      </Link>
    </nav>
  );
}
