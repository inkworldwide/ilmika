import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollegeCard from "@/components/property/CollegeCard";
import HeroSearchForm from "@/components/home/HeroSearchForm";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";
import {
  GraduationCap, MapPin, Search, ShieldCheck, Heart, ArrowRight,
  Sparkles, Users, BookOpen, Award, Star, FlaskConical,
  Stethoscope, Briefcase, Scale, Palette, Globe, Landmark,
  Building2, Compass, Layers, Clock, Flame
} from "lucide-react";

export const revalidate = 60;

const STREAM_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  ENGINEERING:            { label: "Engineering",         icon: <FlaskConical className="w-6 h-6" />,   color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  MEDICAL:                { label: "Medical & Health",    icon: <Stethoscope className="w-6 h-6" />,    color: "text-red-700",    bg: "bg-red-50 border-red-200" },
  MANAGEMENT:             { label: "Management",          icon: <Briefcase className="w-6 h-6" />,      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  LAW:                    { label: "Law",                 icon: <Scale className="w-6 h-6" />,          color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  DESIGN:                 { label: "Design & Art",        icon: <Palette className="w-6 h-6" />,        color: "text-pink-700",   bg: "bg-pink-50 border-pink-200" },
  ARTS:                   { label: "Arts & Humanities",   icon: <BookOpen className="w-6 h-6" />,       color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  COMMERCE:               { label: "Commerce",            icon: <Building2 className="w-6 h-6" />,      color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  INFORMATION_TECHNOLOGY: { label: "IT & Computing",      icon: <Compass className="w-6 h-6" />,        color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦", DE: "🇩🇪",
};

const WORLD_STUDY_RANKS: Record<string, { rank: number; badge: string }> = {
  DK: { rank: 1, badge: "World Rank #1" },
  SE: { rank: 2, badge: "World Rank #2" },
  GB: { rank: 3, badge: "World Rank #3" },
  FI: { rank: 4, badge: "World Rank #4" },
  DE: { rank: 5, badge: "World Rank #5" },
  CA: { rank: 6, badge: "World Rank #6" },
  NO: { rank: 7, badge: "World Rank #7" },
  JP: { rank: 8, badge: "World Rank #8" },
  CH: { rank: 9, badge: "World Rank #9" },
  AU: { rank: 10, badge: "World Rank #10" },
  NL: { rank: 11, badge: "World Rank #11" },
  US: { rank: 12, badge: "World Rank #12" },
  FR: { rank: 13, badge: "World Rank #13" },
  KR: { rank: 14, badge: "World Rank #14" },
  BE: { rank: 15, badge: "World Rank #15" },
  IE: { rank: 16, badge: "World Rank #16" },
  SG: { rank: 17, badge: "World Rank #17" },
  CN: { rank: 18, badge: "World Rank #18" },
  ES: { rank: 19, badge: "World Rank #19" },
  IT: { rank: 20, badge: "World Rank #20" },
  AT: { rank: 21, badge: "World Rank #21" },
  NZ: { rank: 22, badge: "World Rank #22" },
  PT: { rank: 23, badge: "World Rank #23" },
  CZ: { rank: 24, badge: "World Rank #24" },
  PL: { rank: 25, badge: "World Rank #25" },
  EE: { rank: 26, badge: "World Rank #26" },
  SI: { rank: 27, badge: "World Rank #27" },
  IS: { rank: 28, badge: "World Rank #28" },
  LU: { rank: 29, badge: "World Rank #29" },
  IL: { rank: 30, badge: "World Rank #30" },
  LT: { rank: 31, badge: "World Rank #31" },
  LV: { rank: 32, badge: "World Rank #32" },
  HU: { rank: 33, badge: "World Rank #33" },
  SK: { rank: 34, badge: "World Rank #34" },
  GR: { rank: 35, badge: "World Rank #35" },
  HR: { rank: 36, badge: "World Rank #36" },
  MY: { rank: 37, badge: "World Rank #37" },
  AE: { rank: 38, badge: "World Rank #38" },
  QA: { rank: 39, badge: "World Rank #39" },
  CL: { rank: 40, badge: "World Rank #40" },
  SA: { rank: 41, badge: "World Rank #41" },
  TH: { rank: 42, badge: "World Rank #42" },
  TR: { rank: 43, badge: "World Rank #43" },
  RO: { rank: 44, badge: "World Rank #44" },
  BG: { rank: 45, badge: "World Rank #45" },
  KZ: { rank: 46, badge: "World Rank #46" },
  RU: { rank: 47, badge: "World Rank #47" },
  UA: { rank: 48, badge: "World Rank #48" },
  VN: { rank: 49, badge: "World Rank #49" },
  IN: { rank: 50, badge: "World Rank #50" },
};

const COUNTRY_COVERS: Record<string, string> = {
  DK: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=400&q=80",
  SE: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=400&q=80",
  GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80",
  FI: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?auto=format&fit=crop&w=400&q=80",
  DE: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80",
  CA: "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=400&q=80",
  NO: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=400&q=80",
  JP: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80",
  CH: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80",
  AU: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=400&q=80",
  NL: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=400&q=80",
  US: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80",
  FR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
  KR: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=400&q=80",
  BE: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
  IE: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=400&q=80",
  SG: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80",
  CN: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=400&q=80",
  EE: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80",
  NZ: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=400&q=80",
  IN: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80",
};

export default async function HomePage() {
  const collegeInclude = {
    city: true,
    country: true,
    images: { take: 1, orderBy: { sortOrder: "asc" as const } },
    accreditations: { take: 3 },
    courses: {
      where: { isActive: true },
      take: 2,
      orderBy: { annualFees: "asc" as const },
    },
    _count: { select: { courses: true, reviews: true } },
  };

  const rawFeatured = await prisma.college.findMany({
    where: { status: "ACTIVE", isVerified: true },
    include: collegeInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  const rawRecent = await prisma.college.findMany({
    where: { status: "ACTIVE" },
    include: collegeInclude,
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const rawTrending = await prisma.college.findMany({
    where: { status: "ACTIVE" },
    include: collegeInclude,
    orderBy: { viewCount: "desc" },
    take: 6,
  });

  const rawCountries = await prisma.country.findMany({
    include: {
      _count: {
        select: { colleges: { where: { status: "ACTIVE" } } }
      }
    },
  });

  const countries = rawCountries.sort((a, b) => {
    const rankA = WORLD_STUDY_RANKS[a.code]?.rank ?? 99;
    const rankB = WORLD_STUDY_RANKS[b.code]?.rank ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    return b._count.colleges - a._count.colleges;
  });

  const cities = await prisma.city.findMany({
    include: {
      country: { select: { name: true, code: true } },
      _count: {
        select: { colleges: { where: { status: "ACTIVE" } } }
      }
    },
    orderBy: { colleges: { _count: "desc" } },
    take: 8,
  });

  const scholarships = await prisma.scholarship.findMany({
    where: { isFeatured: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const exams = await prisma.entranceExam.findMany({
    where: { isFeatured: true },
    include: { country: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const featuredAdmins = await prisma.user.findMany({
    where: {
      role: { in: ["COLLEGE_ADMIN", "AGENT"] },
      isApproved: true,
      isSuspended: false,
      collegeProfile: { isFeatured: true }
    },
    include: { collegeProfile: true },
    take: 4,
  });

  const serializeCollege = (c: any) => ({
    ...c,
    courses: (c.courses || []).map((course: any) => ({
      ...course,
      annualFees: course.annualFees ? Number(course.annualFees) : 0,
      avgSalary: course.avgSalary ? Number(course.avgSalary) : null,
      highestSalary: course.highestSalary ? Number(course.highestSalary) : null,
    })),
    createdAt: c.createdAt ? c.createdAt.toISOString() : null,
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
  });

  const featuredSafe = rawFeatured.map(serializeCollege);
  const recentSafe = rawRecent.map(serializeCollege);
  const trendingSafe = rawTrending.map(serializeCollege);

  return (
    <div className="min-h-screen bg-secondary flex flex-col text-left">
      <Navbar />

      {/* ── MAIN BODY CONTENT & RIGHT AD SIDEBAR COLUMN (Starts alongside Hero) ── */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left Content Column */}
        <div className="space-y-12 min-w-0">

          {/* ── 1. HERO SECTION ── */}
          <section className="relative w-full bg-[#0B1120] rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
            {/* Ambient Spotlight Lighting & Radial Mesh */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 18% 25%, rgba(212,175,55,0.22) 0%, transparent 45%), radial-gradient(circle at 82% 65%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(59,130,246,0.12) 0%, transparent 50%)" }}
            />

            {/* Subtle Luxury Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"
            />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
                
                {/* LEFT COLUMN: Main Copy + Luxury Search + Stats */}
                <div className="xl:col-span-7 space-y-6 text-left">
                  {/* Glassmorphic Luxury Badge */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-[#D4AF37]/40 text-xs font-semibold tracking-wide shadow-xl shadow-[#D4AF37]/10 backdrop-blur-xl transition-all duration-300 hover:border-[#D4AF37]/70">
                    <span className="flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="text-slate-200">Your Gateway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#D4AF37] to-[#F59E0B] font-bold">Global Education.</span></span>
                  </div>

                  {/* Masterpiece Headline */}
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.12] tracking-tight">
                    Find Your Ideal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#D4AF37] to-[#F59E0B] italic font-normal">College</span> <br />
                    Across the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FBBF24] to-[#FEF08A]">Globe</span>
                  </h1>

                  {/* Subtitle & Value Proposition */}
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                    Search, compare, and apply to 12,000+ top-accredited universities across 180+ countries. 
                    Discover <span className="text-white font-semibold">Bachelor's, Master's, PhD</span>, and online programmes with direct fee transparency.
                  </p>

                  {/* Executive Command Search Bar */}
                  <HeroSearchForm countries={countries} />

                  {/* Trust Avatars & Metallic Metric Bar */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
                    {/* Student Trust Proof */}
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Student" />
                        <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Student" />
                        <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Student" />
                        <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Student" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[#D4AF37] text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                          ))}
                          <span className="font-bold text-white ml-1">4.9/5</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">Trusted by 2M+ Scholars</p>
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-serif font-bold text-[#D4AF37] text-lg">12,000+</p>
                        <p className="text-slate-400 text-[9px] font-mono uppercase font-bold tracking-wider">Colleges</p>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <p className="font-serif font-bold text-[#D4AF37] text-lg">180+</p>
                        <p className="text-slate-400 text-[9px] font-mono uppercase font-bold tracking-wider">Countries</p>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <p className="font-serif font-bold text-[#D4AF37] text-lg">50k+</p>
                        <p className="text-slate-400 text-[9px] font-mono uppercase font-bold tracking-wider">Courses</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Image Composition & Clean Floating Glass Cards */}
                <div className="xl:col-span-5 relative flex justify-center xl:justify-end pt-4 xl:pt-0">
                  <div className="relative w-full max-w-sm">
                    
                    {/* Main Large Image: Iconic Campus */}
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl shadow-slate-950 bg-slate-900 group ring-1 ring-white/10">
                      <img
                        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80"
                        alt="University Campus"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Secondary Image: Modern Library / Students */}
                    <div className="absolute -bottom-4 -left-4 w-40 aspect-[4/3] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl hidden sm:block bg-slate-900 ring-1 ring-white/10">
                      <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
                        alt="Students Learning"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Floating Glass Badge 1: Verification */}
                    <div className="absolute -top-3 -left-3 bg-slate-950/90 border border-emerald-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-left z-30 ring-1 ring-white/10">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-white flex items-center gap-1">
                          <span>Verified Institution</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </p>
                        <p className="text-[9px] text-slate-300 font-medium">Govt Accredited</p>
                      </div>
                    </div>

                    {/* Floating Glass Badge 2: Destinations */}
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-slate-950/90 border border-[#D4AF37]/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl space-y-2 text-left z-30 min-w-[190px] ring-1 ring-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#D4AF37] tracking-wider">Destinations</span>
                        <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium text-slate-200">
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">🇮🇳 IN</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">🇺🇸 US</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">🇬🇧 UK</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">🇨🇦 CA</span>
                      </div>
                      
                      <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-[#D4AF37] font-mono font-bold">180+ Global Options</span>
                        <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30">Active</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── 2. BROWSE BY STREAM ── */}
          <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Browse by Stream</h2>
            <p className="text-xs font-semibold text-sky-900 bg-sky-50 border border-sky-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Explore programmes across every academic discipline worldwide.</span>
            </p>
          </div>
          <Link href="/colleges" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
            All Streams <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(STREAM_META).map(([key, meta]) => (
            <Link
              key={key}
              href={`/colleges?stream=${key}`}
              className={`group border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:shadow-sm transition ${meta.bg}`}
            >
              <div className={`${meta.color}`}>{meta.icon}</div>
              <p className={`text-[11px] font-bold ${meta.color} leading-snug`}>{meta.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. FEATURED VERIFIED COLLEGES ── */}
      {featuredSafe.length > 0 && (
        <section className="py-16 bg-white border-y border-line">
          <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="w-7 h-7 text-accent" /> Top Verified Colleges
                </h2>
                <p className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Accredited institutions with verified listings and transparent data.</span>
                </p>
              </div>
              <Link href="/colleges?isVerified=true" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSafe.map((c: any) => (
                <CollegeCard key={c.id} college={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. DEGREES: UNDERGRADUATE & POSTGRADUATE ── */}
      <section className="py-16 max-w-7xl mx-auto w-full px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Undergraduate */}
        <div className="space-y-5">
          <div className="flex justify-between items-end border-b border-line pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" /> Undergraduate Programmes
              </h3>
              <p className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Bachelor's degrees and integrated programmes.</span>
              </p>
            </div>
            <Link href="/colleges?degree=BACHELOR" className="text-[10px] font-bold text-slate-400 hover:text-accent font-mono uppercase">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { stream: "ENGINEERING", desc: "B.Tech / B.E. / B.Sc Engg" },
              { stream: "MEDICAL", desc: "MBBS / BDS / B.Pharm" },
              { stream: "MANAGEMENT", desc: "BBA / BMS / B.Com" },
              { stream: "LAW", desc: "BA LLB / BBA LLB / LLB" },
            ].map(({ stream, desc }) => (
              <Link
                key={stream}
                href={`/colleges?degree=BACHELOR&stream=${stream}`}
                className="bg-white border border-line rounded-xl p-4 hover:shadow-sm hover:border-accent/30 transition group"
              >
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${STREAM_META[stream]?.color || "text-slate-600"}`}>
                  {STREAM_META[stream]?.label || stream}
                </div>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
                <p className="text-[10px] font-mono text-accent mt-2 group-hover:translate-x-1 transition-transform">Explore →</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Postgraduate */}
        <div className="space-y-5">
          <div className="flex justify-between items-end border-b border-line pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" /> Postgraduate Programmes
              </h3>
              <p className="text-xs font-semibold text-purple-900 bg-purple-50 border border-purple-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Master's, MBA, and doctoral programmes.</span>
              </p>
            </div>
            <Link href="/colleges?degree=MASTER" className="text-[10px] font-bold text-slate-400 hover:text-accent font-mono uppercase">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { stream: "MANAGEMENT", desc: "MBA / PGDM / Exec MBA" },
              { stream: "ENGINEERING", desc: "M.Tech / M.E. / M.S." },
              { stream: "INFORMATION_TECHNOLOGY", desc: "MCA / M.Sc IT / M.Tech CS" },
              { stream: "SCIENCE", desc: "M.Sc / M.S. Research" },
            ].map(({ stream, desc }) => (
              <Link
                key={stream}
                href={`/colleges?degree=MASTER&stream=${stream}`}
                className="bg-white border border-line rounded-xl p-4 hover:shadow-sm hover:border-accent/30 transition group"
              >
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${STREAM_META[stream]?.color || "text-slate-600"}`}>
                  {STREAM_META[stream]?.label || stream}
                </div>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
                <p className="text-[10px] font-mono text-accent mt-2 group-hover:translate-x-1 transition-transform">Explore →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. RECENTLY ADDED COLLEGES ── */}
      <section className="py-16 bg-white border-t border-line">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Recently Added Colleges</h2>
              <p className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Latest institutions joined the Ilmika network.</span>
              </p>
            </div>
            <Link href="/colleges" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSafe.map((c: any) => (
              <CollegeCard key={c.id} college={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5a. POPULAR COUNTRIES ── */}
      {countries.length > 0 && (
        <section className="py-16 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                <Globe className="w-7 h-7 text-accent" /> Study Destinations
              </h2>
              <p className="text-xs font-semibold text-amber-900 bg-amber-50/90 border border-amber-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Discover colleges across the world's leading education destinations.</span>
              </p>
            </div>
            <Link href="/colleges" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
              All Countries <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {countries.slice(0, 6).map((country: any) => {
              const cover = COUNTRY_COVERS[country.code] || "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=400&q=80";
              const rankInfo = WORLD_STUDY_RANKS[country.code];
              return (
                <Link
                  key={country.id}
                  href={`/colleges?country=${country.code}`}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-line shadow-xs transition hover:shadow"
                >
                  <img src={cover} alt={country.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10" />
                  {rankInfo && (
                    <div className="absolute top-3 right-3 z-20 bg-primary/80 backdrop-blur-xs text-accent border border-accent/40 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full shadow-xs">
                      {rankInfo.badge}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 z-20 text-white space-y-0.5">
                    <p className="font-serif text-sm font-bold">{country.name}</p>
                    <p className="text-[9px] font-mono font-bold tracking-wider opacity-85 pt-1">
                      {country._count.colleges} {country._count.colleges === 1 ? "COLLEGE" : "COLLEGES"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 5b. TOP CITIES ── */}
      {cities.length > 0 && (
        <section className="py-16 bg-white border-t border-line">
          <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                  <MapPin className="w-7 h-7 text-accent" /> Popular Education Cities
                </h2>
                <p className="text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Top cities with the highest concentration of top-ranked institutions.</span>
                </p>
              </div>
              <Link href="/colleges" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase shrink-0">
                See All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cities.map((city: any) => (
                <Link
                  key={city.id}
                  href={`/colleges?cityId=${city.id}`}
                  className="group bg-white border border-line rounded-xl px-4 py-3.5 hover:shadow-sm hover:border-accent/30 transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-xs text-primary group-hover:text-accent transition">{city.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {city.country.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-secondary border border-line text-slate-500 px-2 py-0.5 rounded-full">
                    {city._count.colleges}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5c. TRENDING COLLEGES ── */}
      {trendingSafe.length > 0 && (
        <section className="py-16 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-accent" /> Trending Right Now
              </h2>
              <p className="text-xs font-semibold text-orange-950 bg-orange-50 border border-orange-200/90 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Most-viewed colleges this week — popular with students like you.</span>
              </p>
            </div>
            <Link href="/colleges" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
              Explore More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingSafe.map((c: any) => (
              <CollegeCard key={c.id} college={c} />
            ))}
          </div>
        </section>
      )}

      {/* ── 6. FEATURED SCHOLARSHIPS ── */}
      {scholarships.length > 0 && (
        <section className="py-16 bg-white border-t border-line">
          <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                  <Award className="w-7 h-7 text-accent" /> Featured Scholarships
                </h2>
                <p className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Funding opportunities to help you study your dream programme.</span>
                </p>
              </div>
              <Link href="/scholarships" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
                All Scholarships <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scholarships.map((s: any) => (
                <Link
                  key={s.id}
                  href="/scholarships"
                  className="group bg-white border border-line rounded-2xl p-6 space-y-3 hover:shadow-md hover:border-accent/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-primary group-hover:text-accent transition">{s.title || s.name}</h4>
                    <p className="text-xs text-slate-500">{s.provider || s.description}</p>
                    {s.amount && (
                      <p className="font-mono font-bold text-accent text-sm">
                        {s.currency === "INR" ? "₹" : s.currency}{" "}
                        {Number(s.amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-line">
                    <span className="text-[11px] font-bold text-accent font-mono uppercase group-hover:underline flex items-center gap-1">
                      Apply <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. HOW IT WORKS ── */}
      <section className="py-16 bg-white border-t border-line">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">How Ilmika Works</h2>
            <p className="text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Your path from search to enrolment — simplified.</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <Search className="w-5 h-5" />, title: "Search Colleges", desc: "Filter by stream, country, degree, fees, and more to find the perfect match." },
              { icon: <Heart className="w-5 h-5" />, title: "Shortlist Favourites", desc: "Save colleges you love to your shortlist and compare them side-by-side." },
              { icon: <BookOpen className="w-5 h-5" />, title: "Apply or Enquire", desc: "Apply directly to colleges or send a quick enquiry to the admissions team." },
              { icon: <Users className="w-5 h-5" />, title: "Book Counselling", desc: "Schedule a video or in-person counselling session with a college advisor." },
            ].map((step, i) => (
              <div key={i} className="bg-secondary border border-line rounded-2xl p-6 space-y-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
                  {step.icon}
                </div>
                <div className="w-6 h-6 rounded-full bg-primary text-accent text-[11px] font-bold flex items-center justify-center mx-auto font-mono">
                  {i + 1}
                </div>
                <h4 className="font-serif text-base font-bold text-primary">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. TOP COLLEGE ADVISORS ── */}
      {featuredAdmins.length > 0 && (
        <section className="py-16 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Featured College Advisors</h2>
            <p className="text-xs font-semibold text-violet-900 bg-violet-50 border border-violet-200/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-xs">
              <Users className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span>Connect with verified college administrators and education counsellors.</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAdmins.map((admin: any) => {
              const cleanName = admin.name.replace(/\s*\([^)]*\)/g, "").trim();
              return (
                <div
                  key={admin.id}
                  className="bg-secondary border border-line rounded-2xl p-5 text-center space-y-4 flex flex-col items-center"
                >
                  {admin.avatar ? (
                    <img src={admin.avatar} alt={cleanName} className="w-16 h-16 rounded-full object-cover border border-line" />
                  ) : (
                    <span className="w-16 h-16 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-xl uppercase border border-line">
                      {cleanName.charAt(0)}
                    </span>
                  )}
                  <div>
                    <h4 className="font-semibold text-sm text-primary">{cleanName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                      {admin.collegeProfile?.organizationName || "Education Advisor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white border border-line px-3 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    <span>{admin.collegeProfile?.ratingAverage || 0} Rating</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 10. TESTIMONIALS ── */}
      <section className="py-16 bg-white border-t border-line">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Student Success Stories</h2>
            <p className="text-xs text-slate-500">Hear from students who found their dream college on Ilmika.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "I was confused about which engineering college to pick for my B.Tech. Ilmika let me compare 6 colleges side-by-side on fees, rankings, and placements. I got into IIT Delhi!",
                name: "Arjun Sharma", role: "B.Tech Student, IIT Delhi 🇮🇳", initial: "A"
              },
              {
                text: "Finding an MBA programme in the United Kingdom as an international student was overwhelming. Ilmika filtered everything by my budget and IELTS score. I'm now at Warwick Business School.",
                name: "Priya Mehta", role: "MBA Student, Warwick United Kingdom 🇬🇧", initial: "P"
              },
              {
                text: "The scholarship search feature is incredible. I found three scholarships I didn't know existed for my Master's in Computer Science. Saved me over $30,000 in fees!",
                name: "Lucas Chen", role: "MS CS Student, Stanford United States 🇺🇸", initial: "L"
              },
            ].map((t, i) => (
              <div key={i} className="bg-secondary border border-line rounded-2xl p-6 space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-accent fill-accent" />)}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">{t.initial}</span>
                  <div>
                    <p className="text-[11px] font-bold text-primary">{t.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono uppercase">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        </div>

        {/* Right Column: Adds Buzz Banner Column */}
        <AdSidebarColumn page="home" className="hidden lg:block" />
      </div>

      {/* ── 11. FINAL CTA: FOR COLLEGES ── */}
      <section className="py-16 bg-primary text-secondary border-t border-line text-center">
        <div className="max-w-xl mx-auto px-5 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">List Your College on Ilmika</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Reach over 2 million students actively searching for their perfect programme. 
            List your institution, showcase your courses, and receive direct applications — all for free.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/colleges/add"
              className="bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-7 py-3 rounded-full transition cursor-pointer shadow-[0_8px_20px_-6px_rgba(212,175,55,0.4)]"
            >
              List Your College Free
            </Link>
            <Link
              href="/auth/register"
              className="border border-white/20 hover:bg-white/5 text-white font-bold text-xs px-7 py-3 rounded-full transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
