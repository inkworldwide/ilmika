"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SERVICES_DATA } from "./NavMenu";

export default function MobileNavMenu({ closeMenu }: { closeMenu: () => void }) {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleService = (name: string) => {
    setExpandedService(expandedService === name ? null : name);
  };

  return (
    <div className="flex flex-col gap-1.5 pt-3 text-[15px] font-semibold text-primary/80">
      <Link href="/" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Home
      </Link>

      <div className="border-b border-line/30">
        <div className="py-2.5 text-primary">Services</div>
        <div className="pl-4 pb-2 flex flex-col gap-2">
          {SERVICES_DATA.map((service) => (
            <div key={service.name} className="border-l-2 border-line/50 pl-3">
              <button
                onClick={() => toggleService(service.name)}
                className="flex items-center justify-between w-full py-2 text-left font-semibold text-slate-700 hover:text-accent transition"
              >
                {service.name}
                {expandedService === service.name ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {expandedService === service.name && (
                <div className="pl-2 pb-2 flex flex-col gap-3 mt-1">
                  {service.hasAvailableRequired ? (
                    <>
                      <div className="font-bold text-accent text-[13px] uppercase tracking-wider mt-2">Available (Listing)</div>
                      <MobileCategoryList categories={service.categories} closeMenu={closeMenu} />
                      <div className="font-bold text-accent text-[13px] uppercase tracking-wider mt-4">Required (What Users Want)</div>
                      <div className="bg-slate-900 text-white rounded-xl p-3.5 text-xs space-y-2.5 border border-slate-800 my-1">
                        <p className="text-slate-300 leading-relaxed">Can't find your ideal property? Post your requirement to get matched directly with verified owners & agents.</p>
                        <Link 
                          href={`/inquire?purpose=${encodeURIComponent(service.name)}`} 
                          onClick={closeMenu} 
                          className="inline-block bg-accent hover:bg-accent-hover text-primary font-bold px-3.5 py-1.5 rounded-lg text-xs"
                        >
                          + Post Requirement Now
                        </Link>
                      </div>
                    </>
                  ) : (
                    <MobileCategoryList categories={service.categories} closeMenu={closeMenu} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Link href="/about" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        About Us
      </Link>
      <Link href="/contact" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Contact
      </Link>
      <Link href="/inquire" onClick={closeMenu} className="py-2">
        Inquire
      </Link>
    </div>
  );
}

const MobileCategoryList = ({ categories, closeMenu }: { categories: any[], closeMenu: () => void }) => {
  return (
    <div className="flex flex-col gap-4 pl-2">
      {categories.map((cat, idx) => (
        <div key={idx}>
          <div className="font-medium text-primary text-sm mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
            {cat.name}
          </div>
          <div className="flex flex-col gap-2 pl-3 border-l border-line/30 ml-0.5">
            {cat.types.map((type: any, tIdx: number) => (
              <div key={tIdx} className="text-[13px] text-slate-600">
                <Link href="/properties" onClick={closeMenu} className="block">{type.name}</Link>
                {type.hasBhk && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['1BHK', '2BHK', '3BHK', '4BHK+'].map(bhk => (
                      <Link key={bhk} href="/properties" onClick={closeMenu} className="text-[9px] px-1.5 border border-line rounded text-slate-500">
                        {bhk}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
