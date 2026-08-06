"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, BookOpen, GraduationCap, Briefcase, FlaskConical, Scale, Palette, Building2, Stethoscope, Compass, Layers, Search, X } from "lucide-react";
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
  PHARMACY: <Stethoscope className="w-3.5 h-3.5 text-accent" />,
  ARCHITECTURE: <Building2 className="w-3.5 h-3.5 text-accent" />,
};

const STREAM_LABELS: Record<string, string> = {
  ENGINEERING: "Engineering",
  MEDICAL: "Medical",
  MANAGEMENT: "Management",
  LAW: "Law",
  ARTS: "Arts",
  COMMERCE: "Commerce",
  SCIENCE: "Science",
  DESIGN: "Design",
  INFORMATION_TECHNOLOGY: "IT",
  PHARMACY: "Pharmacy",
  ARCHITECTURE: "Architecture",
};

const STREAM_BRANCHES: Record<string, { name: string; query: string }[]> = {
  ENGINEERING: [
    { name: "Computer Science & Engg", query: "Computer Science" },
    { name: "AI & Data Science", query: "Artificial Intelligence" },
    { name: "Electronics & Comm (ECE)", query: "Electronics" },
    { name: "Electrical & Electronics (EEE)", query: "Electrical" },
    { name: "Mechanical Engineering", query: "Mechanical" },
    { name: "Civil Engineering", query: "Civil" },
    { name: "Biotech & Chemical Engg", query: "Biotechnology" },
    { name: "Aerospace & Aeronautical", query: "Aerospace" },
    { name: "Robotics & Automation", query: "Robotics" },
    { name: "Mechatronics Engineering", query: "Mechatronics" },
  ],
  MEDICAL: [
    { name: "MBBS (Medicine & Surgery)", query: "MBBS" },
    { name: "BDS (Dental Surgery)", query: "BDS" },
    { name: "B.Sc Nursing & Clinical Care", query: "Nursing" },
    { name: "Pharmacy & Drug Research", query: "Pharmacy" },
    { name: "Physiotherapy (BPT)", query: "Physiotherapy" },
    { name: "MD / MS Clinical Specialisations", query: "Clinical" },
    { name: "Medical Lab Tech (BMLT)", query: "Laboratory" },
    { name: "Radiology & Imaging Tech", query: "Radiology" },
  ],
  MANAGEMENT: [
    { name: "Finance & Banking", query: "Finance" },
    { name: "Marketing & Brand Mgmt", query: "Marketing" },
    { name: "Human Resource Mgmt (HR)", query: "Human Resource" },
    { name: "Operations & Supply Chain", query: "Supply Chain" },
    { name: "Business Analytics & IT", query: "Analytics" },
    { name: "International Business", query: "International Business" },
    { name: "Entrepreneurship & Innovation", query: "Entrepreneurship" },
    { name: "Healthcare & Hospital Mgmt", query: "Hospital Management" },
  ],
  LAW: [
    { name: "Corporate & Commercial Law", query: "Corporate Law" },
    { name: "Criminal Law & Criminology", query: "Criminal Law" },
    { name: "Intellectual Property (IPR)", query: "Intellectual Property" },
    { name: "Constitutional & Human Rights", query: "Constitutional Law" },
    { name: "Cyber Law & Tech Regulation", query: "Cyber Law" },
    { name: "International Trade Law", query: "International Law" },
  ],
  ARTS: [
    { name: "English Literature & Comm", query: "English" },
    { name: "Psychology & Behavioural Science", query: "Psychology" },
    { name: "Journalism & Mass Media", query: "Journalism" },
    { name: "Political Science & Int Affairs", query: "Political Science" },
    { name: "Sociology & Social Work", query: "Sociology" },
    { name: "Public Policy & Governance", query: "Public Policy" },
  ],
  COMMERCE: [
    { name: "Accounting & Auditing (CA/CPA)", query: "Accounting" },
    { name: "Financial Management & Banking", query: "Banking" },
    { name: "Economics & Econometrics", query: "Economics" },
    { name: "Corporate Taxation & Finance", query: "Taxation" },
    { name: "E-Commerce & Digital Business", query: "E-Commerce" },
  ],
  SCIENCE: [
    { name: "Physics & Astronomy", query: "Physics" },
    { name: "Chemistry & Materials Science", query: "Chemistry" },
    { name: "Mathematics & Statistics", query: "Mathematics" },
    { name: "Biotechnology & Biochemistry", query: "Biotechnology" },
    { name: "Environmental Science", query: "Environmental" },
    { name: "Microbiology & Genetics", query: "Microbiology" },
  ],
  DESIGN: [
    { name: "Bachelor of Architecture (B.Arch)", query: "Architecture" },
    { name: "Graphic & UI/UX Design", query: "UI/UX" },
    { name: "Fashion & Apparel Design", query: "Fashion" },
    { name: "Interior & Spatial Design", query: "Interior" },
    { name: "Industrial & Product Design", query: "Industrial Design" },
    { name: "Animation & Game Design", query: "Animation" },
  ],
  INFORMATION_TECHNOLOGY: [
    { name: "Computer Applications (BCA/MCA)", query: "BCA" },
    { name: "Cybersecurity & Hacking", query: "Cybersecurity" },
    { name: "Cloud Computing & DevOps", query: "Cloud" },
    { name: "Software Engineering", query: "Software" },
    { name: "AI & Machine Learning", query: "Machine Learning" },
    { name: "Data Engineering & Big Data", query: "Data Engineering" },
  ],
  PHARMACY: [
    { name: "Bachelor of Pharmacy (B.Pharm)", query: "B.Pharm" },
    { name: "Doctor of Pharmacy (Pharm.D)", query: "Pharm.D" },
    { name: "Pharmaceutical Chemistry", query: "Pharmaceutical" },
    { name: "Pharmacology & Toxicology", query: "Pharmacology" },
    { name: "Clinical Pharmacy Practice", query: "Clinical Pharmacy" },
  ],
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
      { name: "Engineering & M.Tech", streamParam: "ENGINEERING" },
      { name: "MBA / Business Management", streamParam: "MANAGEMENT" },
      { name: "Medical & MD Clinical", streamParam: "MEDICAL" },
      { name: "LLM Law Masters", streamParam: "LAW" },
      { name: "MA / Arts Masters", streamParam: "ARTS" },
      { name: "M.Com Finance", streamParam: "COMMERCE" },
      { name: "M.Sc Science Research", streamParam: "SCIENCE" },
      { name: "M.Design & Architecture", streamParam: "DESIGN" },
      { name: "MCA / IT Masters", streamParam: "INFORMATION_TECHNOLOGY" },
      { name: "M.Pharm Pharmacy", streamParam: "PHARMACY" },
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
      { name: "Social Science Research", streamParam: "ARTS" },
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
      { name: "Design Diploma", streamParam: "DESIGN" },
    ]
  },
  {
    name: "Online / Distance",
    href: "/colleges?mode=ONLINE",
    degreeParam: null,
    streams: [
      { name: "Online Business & MBA", streamParam: "MANAGEMENT" },
      { name: "Online B.Tech & Engg", streamParam: "ENGINEERING" },
      { name: "Distance B.A. Arts", streamParam: "ARTS" },
      { name: "Distance B.Com Finance", streamParam: "COMMERCE" },
      { name: "Online MCA & IT", streamParam: "INFORMATION_TECHNOLOGY" },
    ]
  },
];

export default function NavMenu() {
  const [activeProgramme, setActiveProgramme] = useState<string>("Undergraduate");
  const [activeStreamParam, setActiveStreamParam] = useState<string>("ENGINEERING");
  const [branchSearchQuery, setBranchSearchQuery] = useState<string>("");
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

  // Compute filtered branches
  const filteredBranches = useMemo(() => {
    const q = branchSearchQuery.toLowerCase().trim();
    if (!q) {
      return (STREAM_BRANCHES[activeStreamParam] || STREAM_BRANCHES["ENGINEERING"]).map(b => ({
        ...b,
        streamParam: activeStreamParam,
      }));
    }

    // Search across ALL streams if user types a query
    const results: { name: string; query: string; streamParam: string }[] = [];
    for (const [streamKey, branchList] of Object.entries(STREAM_BRANCHES)) {
      for (const b of branchList) {
        if (b.name.toLowerCase().includes(q) || b.query.toLowerCase().includes(q)) {
          results.push({ ...b, streamParam: streamKey });
        }
      }
    }
    return results;
  }, [activeStreamParam, branchSearchQuery]);

  return (
    <nav className="hidden lg:flex items-center gap-7 text-[14px] font-semibold text-primary/80">
      <Link href="/" className={`hover:text-primary transition ${pathname === "/" ? "text-accent font-bold" : ""}`}>
        Home
      </Link>

      {/* Programmes Mega Menu */}
      <div className="relative group h-18 flex items-center">
        <Link href="/colleges" className="hover:text-primary transition cursor-pointer flex items-center gap-1 font-semibold">
          Programmes <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        </Link>
        
        {/* Dropdown Container */}
        <div className="absolute top-[71px] -left-28 bg-white border border-line shadow-2xl rounded-b-2xl w-[980px] hidden group-hover:flex z-[100] text-sm overflow-hidden animate-fadeIn">
          
          {/* 1. Left Column: Degree Types */}
          <div className="w-[190px] bg-paper border-r border-line py-5 shrink-0">
            <p className="px-5 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Browse Degree</p>
            {PROGRAMMES.map((prog) => (
              <Link 
                href={prog.href}
                key={prog.name}
                onMouseEnter={() => {
                  setActiveProgramme(prog.name);
                  setBranchSearchQuery("");
                  if (prog.streams.length > 0) {
                    setActiveStreamParam(prog.streams[0].streamParam);
                  }
                }}
                className={`px-5 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                  activeProgramme === prog.name 
                    ? 'bg-white text-accent font-bold border-l-4 border-accent shadow-xs' 
                    : 'hover:bg-white/50 text-primary font-medium'
                }`}
              >
                <span>{prog.name}</span>
                <ChevronRight className={`w-4 h-4 transition-opacity ${activeProgramme === prog.name ? 'opacity-100 text-accent' : 'opacity-30'}`} />
              </Link>
            ))}
          </div>

          {/* 2. Middle Column: Streams List */}
          <div className="w-[320px] p-6 border-r border-line bg-white shrink-0">
            <h3 className="font-bold text-accent text-xs font-mono uppercase tracking-wider mb-3 border-b-2 border-accent/30 pb-2 inline-flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent" /> {activeProgramme} Streams
            </h3>

            <ul className="space-y-1">
              {current?.streams.map((stream, i) => {
                const href = current.degreeParam
                  ? `/colleges?degree=${current.degreeParam}&stream=${stream.streamParam}`
                  : `/colleges?mode=ONLINE&stream=${stream.streamParam}`;
                const isHovered = activeStreamParam === stream.streamParam && !branchSearchQuery;
                return (
                  <li key={i}>
                    <Link 
                      href={href}
                      onMouseEnter={() => {
                        setActiveStreamParam(stream.streamParam);
                        setBranchSearchQuery("");
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition text-xs font-semibold ${
                        isHovered 
                          ? "bg-accent/15 text-primary border border-accent/30 font-bold" 
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {STREAM_ICONS[stream.streamParam] || <BookOpen className="w-3.5 h-3.5 text-accent" />}
                        <span>{stream.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isHovered ? "translate-x-0.5 text-accent" : "opacity-30"}`} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="pt-3 border-t border-line mt-3">
              <Link
                href={current?.href || "/colleges"}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent font-mono uppercase tracking-wider hover:underline"
              >
                <span>View All {activeProgramme}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 3. Right Column: Branches Search & List */}
          <div className="flex-1 p-6 bg-slate-50/70 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="font-bold text-primary text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" /> Specialisations &amp; Branches
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {filteredBranches.length} {filteredBranches.length === 1 ? "branch" : "branches"}
                </span>
              </div>

              {/* Branch Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={branchSearchQuery}
                  onChange={(e) => setBranchSearchQuery(e.target.value)}
                  placeholder="Search branch (e.g. Data Science, Finance, AI, MBBS)..."
                  className="w-full pl-8 pr-7 py-2 border border-line rounded-xl text-xs bg-white focus:outline-none focus:border-accent text-primary placeholder:text-slate-400 shadow-2xs font-medium"
                />
                {branchSearchQuery && (
                  <button
                    onClick={() => setBranchSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Branches Grid / Scroll list */}
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {filteredBranches.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-white rounded-xl border border-line">
                    No branches matching "{branchSearchQuery}"
                  </div>
                ) : (
                  filteredBranches.map((branch, idx) => {
                    const targetStream = branch.streamParam || activeStreamParam;
                    const streamLabel = STREAM_LABELS[targetStream] || targetStream;
                    const branchHref = current?.degreeParam
                      ? `/colleges?degree=${current.degreeParam}&stream=${targetStream}&q=${encodeURIComponent(branch.query)}`
                      : `/colleges?stream=${targetStream}&q=${encodeURIComponent(branch.query)}`;
                    return (
                      <Link
                        key={idx}
                        href={branchHref}
                        onMouseEnter={() => setActiveStreamParam(targetStream)}
                        className="group bg-white hover:bg-accent/10 border border-line/80 hover:border-accent/40 rounded-xl px-3.5 py-2 transition flex items-center justify-between shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700 group-hover:text-primary transition">
                            {branch.name}
                          </span>
                          {branchSearchQuery && (
                            <span className="text-[9px] font-mono font-bold uppercase bg-accent/20 border border-accent/30 text-primary px-1.5 py-0.5 rounded-md">
                              {streamLabel}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-transform" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-primary text-white rounded-xl p-3.5 mt-3 flex items-center justify-between border border-primary/20 shrink-0">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-accent font-mono uppercase">Can't find your branch?</p>
                <p className="text-[10px] text-slate-300">Submit your requirement to counsellors.</p>
              </div>
              <Link 
                href={`/inquire?purpose=${encodeURIComponent(activeProgramme)}`}
                className="bg-accent hover:bg-accent-hover text-primary font-bold text-[10px] px-3 py-1.5 rounded-lg transition shadow-xs shrink-0 font-mono uppercase"
              >
                Post Requirement →
              </Link>
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
