"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, BookOpen, GraduationCap, Briefcase, FlaskConical, Scale, Palette, Building2, Stethoscope, Compass } from "lucide-react";
import { usePathname } from "next/navigation";

const STREAM_ICONS: Record<string, React.ReactNode> = {
  ENGINEERING: <FlaskConical className="w-3.5 h-3.5 text-accent" />,
  MEDICAL: <Stethoscope className="w-3.5 h-3.5 text-accent" />,
  MANAGEMENT: <Briefcase className="w-3.5 h-3.5 text-accent" />,
  LAW: <Scale className="w-3.5 h-3.5 text-accent" />,
  DESIGN: <Palette className="w-3.5 h-3.5 text-accent" />,
  ARTS: <BookOpen className="w-3.5 h-3.5 text-accent" />,
  COMMERCE: <Building2 className="w-3.5 h-3.5 text-accent" />,
  SCIENCE: <FlaskConical className="w-3.5 h-3.5 text-accent" />,
  INFORMATION_TECHNOLOGY: <Compass className="w-3.5 h-3.5 text-accent" />,
  ARCHITECTURE: <Building2 className="w-3.5 h-3.5 text-accent" />,
};

const PROGRAMMES = [
  {
    name: "Undergraduate",
    href: "/colleges?degree=BACHELOR",
    degreeParam: "BACHELOR",
    streams: [
      { name: "Engineering & Technology", streamParam: "ENGINEERING" },
      { name: "Medical & Health Sciences", streamParam: "MEDICAL" },
      { name: "Business & Management", streamParam: "MANAGEMENT" },
      { name: "Law & Legal Studies", streamParam: "LAW" },
      { name: "Arts & Humanities", streamParam: "ARTS" },
      { name: "Commerce & Finance", streamParam: "COMMERCE" },
      { name: "Science & Research", streamParam: "SCIENCE" },
      { name: "Design & Architecture", streamParam: "DESIGN" },
      { name: "Information Technology", streamParam: "INFORMATION_TECHNOLOGY" },
      { name: "Pharmacy", streamParam: "PHARMACY" },
    ]
  },
  {
    name: "Postgraduate",
    href: "/colleges?degree=MASTER",
    degreeParam: "MASTER",
    streams: [
      { name: "M.Tech / MS", streamParam: "ENGINEERING" },
      { name: "MBA / PGDM", streamParam: "MANAGEMENT" },
      { name: "MD / MS Medical", streamParam: "MEDICAL" },
      { name: "LLM — Law Masters", streamParam: "LAW" },
      { name: "MA / M.Sc Arts", streamParam: "ARTS" },
      { name: "M.Com / Finance", streamParam: "COMMERCE" },
      { name: "M.Sc Science", streamParam: "SCIENCE" },
      { name: "M.Design", streamParam: "DESIGN" },
      { name: "MCA / M.Tech IT", streamParam: "INFORMATION_TECHNOLOGY" },
    ]
  },
  {
    name: "PhD / Doctorate",
    href: "/colleges?degree=PHD",
    degreeParam: "PHD",
    streams: [
      { name: "Engineering Research", streamParam: "ENGINEERING" },
      { name: "Medical Research", streamParam: "MEDICAL" },
      { name: "Management Research", streamParam: "MANAGEMENT" },
      { name: "Science Research", streamParam: "SCIENCE" },
      { name: "Social Science Research", streamParam: "SOCIAL_SCIENCE" },
      { name: "Law Research", streamParam: "LAW" },
    ]
  },
  {
    name: "Diploma",
    href: "/colleges?degree=DIPLOMA",
    degreeParam: "DIPLOMA",
    streams: [
      { name: "Engineering Diploma", streamParam: "ENGINEERING" },
      { name: "Pharmacy Diploma", streamParam: "PHARMACY" },
      { name: "Management Diploma", streamParam: "MANAGEMENT" },
      { name: "Hotel Management", streamParam: "HOTEL_MANAGEMENT" },
      { name: "Design Diploma", streamParam: "DESIGN" },
      { name: "Education Diploma", streamParam: "EDUCATION" },
    ]
  },
  {
    name: "Online / Distance",
    href: "/colleges?mode=ONLINE",
    degreeParam: null,
    streams: [
      { name: "Online MBA", streamParam: "MANAGEMENT" },
      { name: "Online B.Tech", streamParam: "ENGINEERING" },
      { name: "Distance B.A.", streamParam: "ARTS" },
      { name: "Distance B.Com", streamParam: "COMMERCE" },
      { name: "Online MCA", streamParam: "INFORMATION_TECHNOLOGY" },
      { name: "Online M.Sc", streamParam: "SCIENCE" },
    ]
  },
];

export default function NavMenu() {
  const [activeProgramme, setActiveProgramme] = useState<string>("Undergraduate");
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search.toLowerCase();
      if (search.includes("phd")) setActiveProgramme("PhD / Doctorate");
      else if (search.includes("master")) setActiveProgramme("Postgraduate");
      else if (search.includes("diploma")) setActiveProgramme("Diploma");
      else if (search.includes("online") || search.includes("distance")) setActiveProgramme("Online / Distance");
      else if (search.includes("bachelor")) setActiveProgramme("Undergraduate");
    }
  }, [pathname]);
  
  const current = PROGRAMMES.find(p => p.name === activeProgramme);

  return (
    <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-primary/80">
      <Link href="/" className={`hover:text-primary transition ${pathname === "/" ? "text-accent font-bold" : ""}`}>
        Home
      </Link>

      {/* Programmes Mega Menu */}
      <div className="relative group h-20 flex items-center">
        <Link href="/colleges" className="hover:text-primary transition cursor-pointer flex items-center gap-1 font-semibold">
          Programmes <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        </Link>
        
        {/* Dropdown Container */}
        <div className="absolute top-[79px] -left-32 bg-white border border-line shadow-2xl rounded-b-xl w-[860px] hidden group-hover:flex z-[100] text-sm overflow-hidden">
          
          {/* Left: Programme Types */}
          <div className="w-[210px] bg-paper border-r border-line py-5 shrink-0">
            <p className="px-6 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Browse By Degree</p>
            {PROGRAMMES.map((prog) => (
              <Link 
                href={prog.href}
                key={prog.name}
                onMouseEnter={() => setActiveProgramme(prog.name)}
                className={`px-6 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                  activeProgramme === prog.name 
                    ? 'bg-white text-accent font-bold border-l-4 border-accent shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]' 
                    : 'hover:bg-white/50 text-primary font-medium'
                }`}
              >
                <span>{prog.name}</span>
                <ChevronRight className={`w-4 h-4 transition-opacity ${activeProgramme === prog.name ? 'opacity-100 text-accent' : 'opacity-30'}`} />
              </Link>
            ))}
          </div>

          {/* Right: Streams + Seeker CTA */}
          <div className="flex-1 p-7 bg-white">
            <div className="grid grid-cols-2 gap-8">
              
              {/* Streams column */}
              <div>
                <h3 className="font-bold text-accent text-sm uppercase tracking-wider mb-4 border-b-2 border-accent/30 pb-2 inline-flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-accent" /> {activeProgramme} Streams
                </h3>

                <ul className="space-y-2.5 pt-1">
                  {current?.streams.map((stream, i) => {
                    const href = current.degreeParam
                      ? `/colleges?degree=${current.degreeParam}&stream=${stream.streamParam}`
                      : `/colleges?mode=ONLINE&stream=${stream.streamParam}`;
                    return (
                      <li key={i}>
                        <Link 
                          href={href} 
                          className="hover:text-accent transition flex items-center gap-2.5 font-medium text-slate-600 hover:font-semibold text-[13px] group py-0.5"
                        >
                          {STREAM_ICONS[stream.streamParam] || <BookOpen className="w-3.5 h-3.5 text-accent" />}
                          <span>{stream.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="pt-4">
                  <Link
                    href={current?.href || "/colleges"}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent font-mono uppercase tracking-wider hover:underline"
                  >
                    <span>View All {activeProgramme}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Student requirement CTA column */}
              <div>
                <h3 className="font-bold text-accent text-sm uppercase tracking-wider mb-4 border-b-2 border-accent/30 pb-2 inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Can't Decide?
                </h3>

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-slate-950 via-[#0B132B] to-[#060C1B] text-white rounded-2xl p-5 border border-slate-800 space-y-3 mb-5 shadow-md">
                  <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Custom Study Requirement</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-white leading-snug">
                    Can't Find Your Ideal Programme?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Tell us your stream, budget, and preferred country. Get matched with verified colleges and expert counsellors.
                  </p>
                  <Link 
                    href={`/inquire?purpose=${encodeURIComponent(activeProgramme)}`} 
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    <span>Post Study Requirement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Quick browse by stream */}
                <div>
                  <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-line pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Browse by Stream
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["ENGINEERING", "MEDICAL", "MANAGEMENT", "LAW", "DESIGN", "ARTS"].map(s => (
                      <Link
                        key={s}
                        href={`/colleges?stream=${s}`}
                        className="text-[11px] bg-paper hover:bg-accent/10 border border-line px-2.5 py-1 rounded-full text-slate-500 hover:text-accent transition font-medium cursor-pointer"
                      >
                        {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Link href="/colleges" className={`hover:text-primary transition ${pathname === "/colleges" ? "text-accent font-bold" : ""}`}>
        Colleges
      </Link>
      <Link href="/scholarships" className={`hover:text-primary transition ${pathname === "/scholarships" ? "text-accent font-bold" : ""}`}>
        Scholarships
      </Link>
      <Link href="/exams" className={`hover:text-primary transition ${pathname === "/exams" ? "text-accent font-bold" : ""}`}>
        Entrance Exams
      </Link>
    </nav>
  );
}
