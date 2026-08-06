"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

const MOBILE_PROGRAMMES = [
  {
    name: "Undergraduate",
    href: "/colleges?degree=BACHELOR",
    streams: ["Engineering", "Medical", "Management", "Law", "Arts", "Commerce", "Science", "Design", "IT"],
    streamParams: ["ENGINEERING", "MEDICAL", "MANAGEMENT", "LAW", "ARTS", "COMMERCE", "SCIENCE", "DESIGN", "INFORMATION_TECHNOLOGY"],
  },
  {
    name: "Postgraduate",
    href: "/colleges?degree=MASTER",
    streams: ["M.Tech / MS", "MBA / PGDM", "MD Medical", "LLM Law", "M.Sc Science", "M.Com", "MCA / IT"],
    streamParams: ["ENGINEERING", "MANAGEMENT", "MEDICAL", "LAW", "SCIENCE", "COMMERCE", "INFORMATION_TECHNOLOGY"],
  },
  {
    name: "PhD / Doctorate",
    href: "/colleges?degree=PHD",
    streams: ["Engineering", "Medical", "Management", "Science", "Law", "Social Science"],
    streamParams: ["ENGINEERING", "MEDICAL", "MANAGEMENT", "SCIENCE", "LAW", "SOCIAL_SCIENCE"],
  },
  {
    name: "Diploma",
    href: "/colleges?degree=DIPLOMA",
    streams: ["Engineering", "Pharmacy", "Management", "Hotel Mgmt", "Design"],
    streamParams: ["ENGINEERING", "PHARMACY", "MANAGEMENT", "HOTEL_MANAGEMENT", "DESIGN"],
  },
  {
    name: "Online / Distance",
    href: "/colleges?mode=ONLINE",
    streams: ["Online MBA", "Online B.Tech", "Distance B.A.", "Distance B.Com", "Online MCA"],
    streamParams: ["MANAGEMENT", "ENGINEERING", "ARTS", "COMMERCE", "INFORMATION_TECHNOLOGY"],
  },
];

export default function MobileNavMenu({ closeMenu }: { closeMenu: () => void }) {
  const [expandedProg, setExpandedProg] = useState<string | null>(null);

  const toggleProg = (name: string) => {
    setExpandedProg(expandedProg === name ? null : name);
  };

  return (
    <div className="flex flex-col gap-1.5 pt-3 text-[15px] font-semibold text-primary/80">
      <Link href="/" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Home
      </Link>

      {/* Programmes accordion */}
      <div className="border-b border-line/30">
        <Link href="/colleges" onClick={closeMenu} className="py-2.5 text-primary font-bold hover:text-accent transition block">
          Programmes →
        </Link>
        <div className="pl-4 pb-2 flex flex-col gap-2">
          {MOBILE_PROGRAMMES.map((prog) => (
            <div key={prog.name} className="border-l-2 border-line/50 pl-3">
              <button
                onClick={() => toggleProg(prog.name)}
                className="flex items-center justify-between w-full py-2 text-left font-semibold text-slate-700 hover:text-accent transition"
              >
                {prog.name}
                {expandedProg === prog.name ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expandedProg === prog.name && (
                <div className="pl-2 pb-2 flex flex-col gap-2 mt-1">
                  {prog.streams.map((stream, i) => (
                    <Link
                      key={i}
                      href={`/colleges?degree=${prog.name === "Online / Distance" ? "" : prog.href.split("=")[1]}&stream=${prog.streamParams[i]}${prog.name === "Online / Distance" ? "&mode=ONLINE" : ""}`}
                      onClick={closeMenu}
                      className="text-[13px] text-slate-600 hover:text-accent transition block"
                    >
                      {stream}
                    </Link>
                  ))}
                  <Link
                    href={prog.href}
                    onClick={closeMenu}
                    className="text-[11px] font-bold text-accent font-mono uppercase tracking-wider mt-1 hover:underline"
                  >
                    View All →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Link href="/colleges" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Colleges
      </Link>
      <Link href="/scholarships" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Scholarships
      </Link>
      <Link href="/exams" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Entrance Exams
      </Link>
      <Link href="/about" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        About Us
      </Link>
      <Link href="/contact" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Contact
      </Link>
      <Link href="/inquire" onClick={closeMenu} className="py-2">
        Post Study Requirement
      </Link>
    </div>
  );
}
