"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
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
    hasAvailableRequired: false,
    categories: SHARED_CATEGORIES
  },
  {
    name: "Selling",
    href: "/properties?transactionType=SALE",
    txParam: "SALE",
    hasAvailableRequired: false,
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
    hasAvailableRequired: false,
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
                  <h3 className="font-bold text-accent text-lg mb-6 border-b-2 border-accent/20 pb-2 inline-block">Available (Listing)</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <CategoryList 
                      categories={SERVICES_DATA.find(s => s.name === activeService)?.categories || []} 
                      txParam={SERVICES_DATA.find(s => s.name === activeService)?.txParam} 
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-accent text-lg mb-6 border-b-2 border-accent/20 pb-2 inline-block">Required</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <CategoryList 
                      categories={SERVICES_DATA.find(s => s.name === activeService)?.categories || []} 
                      txParam={SERVICES_DATA.find(s => s.name === activeService)?.txParam} 
                    />
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
