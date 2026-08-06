"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { ALL_COUNTRIES } from "../../../prisma/data/allCountries";

interface CountryOption {
  code: string;
  name: string;
  flag?: string | null;
}

interface SearchableCountrySelectProps {
  countries?: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableCountrySelect({
  countries = [],
  value,
  onChange,
  placeholder = "All Countries",
  className = "",
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveCountries = useMemo(() => {
    if (countries && countries.length > 0) {
      return countries;
    }
    return ALL_COUNTRIES;
  }, [countries]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedCountryObj = useMemo(() => {
    return effectiveCountries.find((c) => c.code.toLowerCase() === value.toLowerCase() || c.name.toLowerCase() === value.toLowerCase());
  }, [effectiveCountries, value]);

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return effectiveCountries;
    return effectiveCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [effectiveCountries, search]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-4 py-3 text-xs md:text-sm text-slate-700 bg-slate-50 border border-line rounded-xl flex items-center justify-between gap-2 focus:outline-none focus:border-accent cursor-pointer transition hover:bg-slate-100/80"
      >
        <span className="truncate font-medium">
          {selectedCountryObj ? selectedCountryObj.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[240px] max-h-80 bg-white border border-line rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Sticky Search Bar Above Afghanistan */}
          <div className="p-2 border-b border-line bg-slate-50 sticky top-0 z-10">
            <div className="relative flex items-center bg-white border border-line rounded-xl px-2.5 py-1.5 focus-within:border-accent">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full text-xs text-primary placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1 p-1 max-h-60 space-y-0.5">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                !value ? "bg-accent/15 text-accent font-bold" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>All Countries</span>
              {!value && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
            </button>

            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-mono">
                No matching country found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? "bg-accent/15 text-accent font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
