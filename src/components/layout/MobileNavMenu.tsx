"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

const MOBILE_PROGRAMMES = [
  {
    name: "Undergraduate",
    href: "/colleges?degree=BACHELOR",
    degreeParam: "BACHELOR",
    streams: [
      { name: "Engineering & Technology", param: "ENGINEERING", branches: ["Computer Science", "Artificial Intelligence", "Electronics", "Electrical", "Mechanical", "Civil"] },
      { name: "Medical & Health Sciences", param: "MEDICAL", branches: ["MBBS", "BDS", "Nursing", "Pharmacy", "Physiotherapy"] },
      { name: "Business & Management", param: "MANAGEMENT", branches: ["Finance", "Marketing", "Human Resource", "Business Analytics"] },
      { name: "Law & Legal Studies", param: "LAW", branches: ["Corporate Law", "Criminal Law", "Intellectual Property"] },
      { name: "Arts & Humanities", param: "ARTS", branches: ["Psychology", "Journalism", "Communication", "Political Science"] },
      { name: "Commerce & Finance", param: "COMMERCE", branches: ["Accounting", "Banking", "Economics"] },
      { name: "Information Technology", param: "INFORMATION_TECHNOLOGY", branches: ["BCA", "Cybersecurity", "Cloud Computing"] },
      { name: "Design & Architecture", param: "DESIGN", branches: ["Architecture", "UI/UX", "Fashion Design"] },
    ],
  },
  {
    name: "Postgraduate",
    href: "/colleges?degree=MASTER",
    degreeParam: "MASTER",
    streams: [
      { name: "M.Tech / Engineering", param: "ENGINEERING", branches: ["Computer Science", "AI & Data", "Robotics"] },
      { name: "MBA / Management", param: "MANAGEMENT", branches: ["Finance", "Marketing", "Operations", "HR"] },
      { name: "MD / MS Medical", param: "MEDICAL", branches: ["Clinical Medicine", "Surgery", "Pediatrics"] },
      { name: "LLM Law Masters", param: "LAW", branches: ["Corporate Law", "Cyber Law"] },
      { name: "MCA / IT Masters", param: "INFORMATION_TECHNOLOGY", branches: ["DevOps", "Cybersecurity", "Software Systems"] },
    ],
  },
  {
    name: "PhD / Doctorate",
    href: "/colleges?degree=PHD",
    degreeParam: "PHD",
    streams: [
      { name: "Engineering Research", param: "ENGINEERING", branches: ["AI", "Nanotechnology"] },
      { name: "Medical Research", param: "MEDICAL", branches: ["Genomics", "Oncology"] },
      { name: "Management Research", param: "MANAGEMENT", branches: ["Economics", "Strategy"] },
    ],
  },
  {
    name: "Diploma & Online",
    href: "/colleges?mode=ONLINE",
    degreeParam: null,
    streams: [
      { name: "Online MBA", param: "MANAGEMENT", branches: ["Finance", "Marketing"] },
      { name: "Online B.Tech / CS", param: "ENGINEERING", branches: ["Computer Science", "AI"] },
      { name: "Online MCA & IT", param: "INFORMATION_TECHNOLOGY", branches: ["Cloud", "Software"] },
    ],
  },
];

export default function MobileNavMenu({ closeMenu }: { closeMenu: () => void }) {
  const [expandedProg, setExpandedProg] = useState<string | null>("Undergraduate");
  const [expandedStream, setExpandedStream] = useState<string | null>(null);

  const toggleProg = (name: string) => {
    setExpandedProg(expandedProg === name ? null : name);
  };

  const toggleStream = (name: string) => {
    setExpandedStream(expandedStream === name ? null : name);
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
        <div className="pl-3 pb-2 flex flex-col gap-2">
          {MOBILE_PROGRAMMES.map((prog) => (
            <div key={prog.name} className="border-l-2 border-line/50 pl-3">
              <button
                onClick={() => toggleProg(prog.name)}
                className="flex items-center justify-between w-full py-2 text-left font-bold text-slate-800 hover:text-accent transition text-sm"
              >
                {prog.name}
                {expandedProg === prog.name ? (
                  <ChevronUp className="w-4 h-4 text-accent" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expandedProg === prog.name && (
                <div className="pl-2 pb-2 flex flex-col gap-2 mt-1">
                  {prog.streams.map((stream, i) => (
                    <div key={i} className="bg-slate-50 border border-line rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/colleges?${prog.degreeParam ? `degree=${prog.degreeParam}&` : ""}stream=${stream.param}`}
                          onClick={closeMenu}
                          className="text-xs font-bold text-primary hover:text-accent transition"
                        >
                          {stream.name}
                        </Link>
                        <button
                          onClick={() => toggleStream(stream.name)}
                          className="text-[10px] font-mono text-accent font-bold hover:underline flex items-center gap-1"
                        >
                          <span>{stream.branches.length} Branches</span>
                          {expandedStream === stream.name ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {expandedStream === stream.name && (
                        <div className="grid grid-cols-1 gap-1 pt-1.5 border-t border-line/60">
                          {stream.branches.map((b, bIdx) => (
                            <Link
                              key={bIdx}
                              href={`/colleges?${prog.degreeParam ? `degree=${prog.degreeParam}&` : ""}stream=${stream.param}&q=${encodeURIComponent(b)}`}
                              onClick={closeMenu}
                              className="text-[11px] font-medium text-slate-600 hover:text-accent transition flex items-center gap-1.5 py-0.5"
                            >
                              <Layers className="w-3 h-3 text-accent" />
                              <span>{b}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <Link
                    href={prog.href}
                    onClick={closeMenu}
                    className="text-[11px] font-bold text-accent font-mono uppercase tracking-wider mt-1 hover:underline"
                  >
                    View All {prog.name} →
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
      <Link href="/contact" onClick={closeMenu} className="py-2.5 border-b border-line/30">
        Contact
      </Link>
      <Link href="/inquire" onClick={closeMenu} className="py-2">
        Post Study Requirement
      </Link>
    </div>
  );
}
