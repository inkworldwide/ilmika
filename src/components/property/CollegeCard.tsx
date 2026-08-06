"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Users, GraduationCap, Heart, ShieldCheck, ArrowUpRight, Star, BookOpen } from "lucide-react";

interface CollegeImage {
  url: string;
  category?: string;
}

interface Course {
  name: string;
  annualFees: number | any;
  feeCurrency?: string;
  degree?: string;
  stream?: string;
}

interface CollegeCardProps {
  college: {
    id: string;
    name: string;
    slug: string;
    collegeType: string;
    isVerified: boolean;
    isFeatured: boolean;
    nirfRanking?: number | null;
    qsRanking?: number | null;
    totalStudents?: number | null;
    city: { name: string };
    country: { name: string; flag?: string | null; code: string };
    images: CollegeImage[];
    courses: Course[];
    accreditations?: { type: string; grade?: string | null }[];
    _count?: { courses?: number; reviews?: number };
  };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const STREAM_COLORS: Record<string, string> = {
  ENGINEERING: "bg-blue-50 text-blue-700 border-blue-200",
  MEDICAL: "bg-red-50 text-red-700 border-red-200",
  MANAGEMENT: "bg-amber-50 text-amber-700 border-amber-200",
  LAW: "bg-purple-50 text-purple-700 border-purple-200",
  DESIGN: "bg-pink-50 text-pink-700 border-pink-200",
  ARTS: "bg-green-50 text-green-700 border-green-200",
  COMMERCE: "bg-orange-50 text-orange-700 border-orange-200",
  SCIENCE: "bg-cyan-50 text-cyan-700 border-cyan-200",
  INFORMATION_TECHNOLOGY: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const formatFees = (amount: number, currency: string = "INR") => {
  if (currency === "INR") {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L/yr`;
    return `₹${amount.toLocaleString("en-IN")}/yr`;
  }
  const symbols: Record<string, string> = { USD: "$", GBP: "£", AUD: "A$", EUR: "€" };
  const sym = symbols[currency] || currency;
  if (amount >= 1000) return `${sym}${(amount / 1000).toFixed(0)}K/yr`;
  return `${sym}${amount}/yr`;
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦", DE: "🇩🇪",
  FR: "🇫🇷", NL: "🇳🇱", SG: "🇸🇬", NZ: "🇳🇿", IE: "🇮🇪", JP: "🇯🇵",
};

export default function CollegeCard({ college, onMouseEnter, onMouseLeave }: CollegeCardProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);

  const coverImage = college.images && college.images.length > 0
    ? college.images[0].url
    : "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";

  const flag = COUNTRY_FLAGS[college.country.code] || college.country.flag || "🏫";

  const naacGrade = college.accreditations?.find(a => a.type === "NAAC")?.grade;
  const ranking = college.nirfRanking || college.qsRanking;
  const rankLabel = college.nirfRanking ? `NIRF #${college.nirfRanking}` : college.qsRanking ? `QS #${college.qsRanking}` : null;

  const topCourses = (college.courses || []).slice(0, 2);
  const uniqueStreams = [...new Set((college.courses || []).map(c => c.stream).filter(Boolean))].slice(0, 3) as string[];

  const handleShortlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShortlisted(!isShortlisted);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="bg-white border border-line rounded-2xl overflow-hidden group flex flex-col justify-between h-full transition duration-300 relative"
    >
      <Link href={`/colleges/${college.id}`} className="block flex-1 flex flex-col">
        {/* Card Header Media */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img
            src={coverImage}
            alt={college.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {college.isVerified && (
              <span className="flex items-center gap-1 bg-accent text-primary text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                VERIFIED
              </span>
            )}
            {college.isFeatured && (
              <span className="bg-primary text-accent text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                FEATURED
              </span>
            )}
          </div>

          {/* Ranking badge */}
          {rankLabel && (
            <span className="absolute bottom-3 left-3 bg-primary text-accent text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-accent" /> {rankLabel}
            </span>
          )}

          {/* NAAC grade */}
          {naacGrade && (
            <span className="absolute bottom-3 right-3 bg-accent text-primary text-[11px] font-bold px-2.5 py-1 rounded-md">
              NAAC {naacGrade}
            </span>
          )}

          {/* Shortlist Button */}
          <button
            onClick={handleShortlist}
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 grid place-items-center hover:bg-white text-slate-400 hover:text-red-500 transition shadow-sm cursor-pointer"
            aria-label="Shortlist college"
          >
            <motion.div
              animate={{ scale: isShortlisted ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? "fill-red-500 text-red-500" : ""}`} />
            </motion.div>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* College name + location */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-base text-primary leading-snug font-semibold line-clamp-2">
                {college.name}
              </h3>
            </div>

            <p className="flex items-center gap-1 text-[13px] text-slate-500 mt-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">
                {college.city.name}, {college.country.name}
              </span>
            </p>

            {/* Stream pills */}
            {uniqueStreams.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {uniqueStreams.map(stream => (
                  <span
                    key={stream}
                    className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${STREAM_COLORS[stream] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {stream.charAt(0) + stream.slice(1).toLowerCase().replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Separator */}
            <div className="w-full h-px bg-line/80 my-3"></div>

            {/* Top courses */}
            {topCourses.length > 0 && (
              <div className="space-y-1.5">
                {topCourses.map((course, i) => {
                  const fees = course.annualFees
                    ? (typeof course.annualFees === "object"
                      ? parseFloat(course.annualFees.toString())
                      : parseFloat(course.annualFees.toString()))
                    : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-600 flex items-center gap-1.5 truncate max-w-[60%]">
                        <BookOpen className="w-3 h-3 text-accent shrink-0" />
                        <span className="truncate">{course.name}</span>
                      </span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {formatFees(fees, course.feeCurrency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Student count */}
            {college.totalStudents && (
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                <Users className="w-3.5 h-3.5" />
                {college.totalStudents.toLocaleString()} students enrolled
              </p>
            )}
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between border-t border-line/60 pt-4 mt-4">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-accent" />
              {college.collegeType.replace("_", " ")}
            </span>
            <span className="text-[11px] font-mono font-bold text-accent hover:text-accent-hover transition flex items-center gap-0.5 uppercase tracking-wider group-hover:translate-x-1 duration-200">
              Know More
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
