"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Globe, ShieldCheck, Star, Heart, Share2, BookOpen, GraduationCap,
  Award, Users, Calendar, Phone, Mail, CheckCircle2, MessageSquare, Send,
  Building, Check, ArrowRight, X, Video, UserCheck, Sparkles, DollarSign, ExternalLink, Lock
} from "lucide-react";

interface CollegeDetailClientProps {
  college: any;
}

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦", DE: "🇩🇪",
  FR: "🇫🇷", NL: "🇳🇱", SG: "🇸🇬", NZ: "🇳🇿", IE: "🇮🇪", JP: "🇯🇵",
};

function formatExamCutoff(examName: string, eligibility: string, collegeName: string) {
  const normEligibility = (eligibility || "").toLowerCase();
  const normCollege = (collegeName || "").toLowerCase();

  // Try extracting exam + score from eligibility text first
  if (normEligibility.includes("ielts")) {
    const match = eligibility.match(/ielts\s*([0-9\.]+)/i);
    if (match && match[1]) return `${examName} Band ${match[1]}+`;
  }
  if (normEligibility.includes("toefl")) {
    const match = eligibility.match(/toefl\s*([0-9]+)/i);
    if (match && match[1]) return `${examName} ${match[1]}+ Score`;
  }
  if (normEligibility.includes("sat")) {
    const match = eligibility.match(/sat\s*([0-9]+)/i);
    if (match && match[1]) return `${examName} ${match[1]}+ Score`;
  }
  
  // Custom cutoff patterns
  if (normEligibility.includes("jee")) {
    if (normCollege.includes("iit")) return `${examName} (AIR 1 - 2,500)`;
    if (normCollege.includes("delhi")) return `${examName} (AIR 1 - 400)`;
    return `${examName} (Qualifying AIR < 15,000)`;
  }
  if (normEligibility.includes("neet")) {
    if (normCollege.includes("aiims")) return `${examName} (705+ Marks)`;
    return `${examName} (650+ Marks / 99+ %ile)`;
  }
  if (normEligibility.includes("cat")) {
    if (normCollege.includes("iim")) return `${examName} (99+ %ile)`;
    return `${examName} (95+ %ile)`;
  }
  if (normEligibility.includes("gate")) {
    return `${examName} (750+ Score)`;
  }

  // Fallback defaults per exam
  const defaultCutoffs: Record<string, string> = {
    IELTS: "Band 6.5 - 7.5+",
    "IELTS Academic": "Band 6.5 - 7.5+",
    "TOEFL iBT": "90 - 110+ Score",
    SAT: "1450 - 1580+ Score",
    GRE: "320 - 335+ Score",
    GMAT: "700 - 750+ Score",
    "JEE Advanced": "AIR 1 - 15,000",
    "NEET UG": "650+ Marks",
    CAT: "95.0+ %ile",
    GATE: "650+ Score",
    CLAT: "AIR 1 - 2,500",
    UCAT: "2800+ Score",
    LNAT: "28+ Score",
    ATAR: "85.00+ Rank",
    TestAS: "100+ Score",
  };

  const scoreLabel = defaultCutoffs[examName];
  if (scoreLabel) return `${examName} (${scoreLabel})`;
  return examName;
}

export default function CollegeDetailClient({ college }: CollegeDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "admissions" | "facilities" | "reviews">("overview");
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Required Modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("");

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [counsellingModalOpen, setCounsellingModalOpen] = useState(false);

  // Form states
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const [counsellingForm, setCounsellingForm] = useState({ date: "", timeSlot: "10:00 AM", type: "VIDEO_CALL", notes: "" });
  const [counsellingSubmitting, setCounsellingSubmitting] = useState(false);
  const [counsellingSuccess, setCounsellingSuccess] = useState(false);

  // Fetch logged-in user on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            setApplyForm(prev => ({
              ...prev,
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
            }));
            setEnquiryForm(prev => ({
              ...prev,
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
            }));
          }
        }
      } catch (e) {
        console.error("Auth check error:", e);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  const requireAuthForAction = (reason: string, actionCallback: () => void) => {
    if (currentUser) {
      actionCallback();
    } else {
      setLoginReason(reason);
      setLoginModalOpen(true);
    }
  };

  const flag = COUNTRY_FLAGS[college.country.code] || college.country.flag || "🏫";
  const images = college.images && college.images.length > 0
    ? college.images
    : [{ url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80" }];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: college.id,
          courseId: selectedCourseId || null,
          ...applyForm,
        }),
      });
      if (res.ok) {
        setApplySuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: college.id,
          ...enquiryForm,
        }),
      });
      if (res.ok) {
        setEnquirySuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleCounselling = async (e: React.FormEvent) => {
    e.preventDefault();
    setCounsellingSubmitting(true);
    try {
      const res = await fetch("/api/counselling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: college.id,
          ...counsellingForm,
        }),
      });
      if (res.ok) {
        setCounsellingSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCounsellingSubmitting(false);
    }
  };

  return (
    <>
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left Column: Main Details Content */}
        <div className="space-y-8 min-w-0">
        {/* Header Banner */}
        <div className="bg-white border border-line rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {college.isVerified && (
                <span className="bg-accent text-primary text-[10px] font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                </span>
              )}
              {college.collegeType && (
                <span className="bg-primary text-accent text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {college.collegeType.replace("_", " ")}
                </span>
              )}
              {college.nirfRanking && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-800" /> NIRF #{college.nirfRanking}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary">{college.name}</h1>
            
            {/* Clickable Google Maps Location Link */}
            {(() => {
              const fullLoc = `${college.name}, ${college.address}, ${college.city.name}, ${college.country.name}`;
              const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLoc)}`;
              
              // Clean up duplicate strings if address already includes city/country
              let formattedAddr = college.address;
              if (!formattedAddr.toLowerCase().includes(college.city.name.toLowerCase())) {
                formattedAddr += `, ${college.city.name}`;
              }
              if (!formattedAddr.toLowerCase().includes(college.country.name.toLowerCase())) {
                formattedAddr += `, ${college.country.name}`;
              }

              return (
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-accent font-medium group transition duration-200 cursor-pointer pt-0.5"
                  title="Click to view campus location & get directions on Google Maps"
                >
                  <MapPin className="w-4 h-4 text-accent group-hover:scale-110 transition duration-200 shrink-0" />
                  <span className="group-hover:underline">
                    {flag} {formattedAddr}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent shrink-0 ml-0.5" />
                </a>
              );
            })()}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => requireAuthForAction("save colleges to your shortlist", () => setIsShortlisted(!isShortlisted))}
              className={`p-3 rounded-2xl border transition flex items-center gap-2 font-bold text-xs cursor-pointer ${
                isShortlisted ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-700 border-line hover:bg-paper"
              }`}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? "fill-red-600 text-red-600" : ""}`} />
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </button>
            <button
              onClick={() => requireAuthForAction("submit your formal application", () => setApplyModalOpen(true))}
              className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 relative">
            <img 
              src={images[activeImage]?.url} 
              alt={college.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80";
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {images.slice(0, 3).map((img: any, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-[16/9] rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                  activeImage === i ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img 
                  src={img.url} 
                  alt={img.altText || college.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout (Left Content + Right Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tabs & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-line overflow-x-auto no-scrollbar gap-6 text-sm font-semibold text-slate-500">
            {[
              { id: "overview", label: "Overview" },
              { id: "courses", label: `Courses (${college.courses?.length || 0})` },
              { id: "admissions", label: "Admissions" },
              { id: "facilities", label: `Facilities (${college.facilities?.length || 0})` },
              { id: "reviews", label: `Reviews (${college.reviews?.length || 0})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition whitespace-nowrap border-b-2 font-bold ${
                  activeTab === tab.id ? "text-accent border-accent" : "border-transparent hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="bg-white border border-line rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-3">About {college.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{college.description}</p>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-line py-5">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Established</p>
                  <p className="font-serif font-bold text-primary text-base">{college.establishedYear || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Total Students</p>
                  <p className="font-serif font-bold text-primary text-base">{college.totalStudents?.toLocaleString() || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Campus Size</p>
                  <p className="font-serif font-bold text-primary text-base">{college.campusArea || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Affiliation</p>
                  <p className="font-serif font-bold text-primary text-base truncate">{college.affiliation || "Autonomous"}</p>
                </div>
              </div>

              {/* Campus Location & Navigation Map */}
              {(() => {
                const mapQuery = `${college.name}, ${college.address}, ${college.city.name}, ${college.country.name}`;
                const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                const mapsDirectUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

                return (
                  <div className="pt-2 space-y-3 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-accent" /> Campus Location &amp; Navigation
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {college.address}, {college.city.name}, {college.country.name}
                        </p>
                      </div>
                      <a
                        href={mapsDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Open Directions in Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative group">
                      <iframe
                        title={`${college.name} Location Map`}
                        src={mapEmbedUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              {college.courses?.length === 0 ? (
                <div className="bg-white border border-line rounded-2xl p-8 text-center text-slate-400 text-sm">
                  No course listings currently active.
                </div>
              ) : (
                college.courses?.map((course: any) => (
                  <div key={course.id} className="bg-white border border-line rounded-2xl p-5 hover:border-accent/40 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-accent/10 text-accent px-2.5 py-0.5 rounded-md uppercase">
                          {course.degree} · {course.stream.replace("_", " ")}
                        </span>
                        <h4 className="font-serif text-base font-bold text-primary mt-1">{course.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-accent text-lg">
                          {course.feeCurrency === "INR" ? "₹" : course.feeCurrency}
                          {Number(course.annualFees).toLocaleString()}/yr
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{course.durationYears} Years · {course.mode.replace("_", " ")}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600"><strong>Eligibility:</strong> {course.eligibility}</p>

                    {course.entranceExams && course.entranceExams.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                        <span className="font-bold text-slate-700">Accepted Exams & Cutoffs:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {course.entranceExams.map((exam: string) => {
                            const formatted = formatExamCutoff(exam, course.eligibility, college.name);
                            return (
                              <span key={exam} className="bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-amber-900 flex items-center gap-1 shadow-2xs">
                                <span>🎯 {formatted}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-line pt-3 mt-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {course.totalSeats ? `${course.totalSeats} seats available` : "Seats on request"}
                      </span>
                      <button
                        onClick={() => {
                          requireAuthForAction("apply for this course", () => {
                            setSelectedCourseId(course.id);
                            setApplyModalOpen(true);
                          });
                        }}
                        className="bg-primary hover:bg-primary/90 text-secondary text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Apply for Course
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ADMISSIONS */}
          {activeTab === "admissions" && (
            <div className="bg-white border border-line rounded-2xl p-6 space-y-6">
              <h3 className="font-serif text-lg font-bold text-primary">Admission Process &amp; Eligibility Facilities</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Admissions to {college.name} are offered based on merit, entrance exam performance, and eligibility criteria. Students can apply online through Ink EduVerse or submit an inquiry directly to the admissions team.
              </p>

              {/* SCHOLARSHIP FACILITY BANNER */}
              {college.hasScholarship && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-serif">
                    <span className="text-lg">🎓</span>
                    <span>Scholarship &amp; Financial Aid Facility</span>
                    <span className="text-[10px] uppercase font-mono font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded ml-auto">
                      Financial Aid Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {college.scholarshipDetails || `${college.name} offers merit-based and need-based tuition scholarships for qualifying domestic and international applicants.`}
                  </p>
                </div>
              )}

              {/* ENTRANCE EXAMS & CUTOFFS BANNER */}
              {college.hasEntranceExam && (
                <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-sm font-serif">
                    <span className="text-lg">🎯</span>
                    <span>Required Entrance Exams &amp; Course Cutoffs</span>
                    <span className="text-[10px] uppercase font-mono font-bold bg-sky-200/60 text-sky-900 px-2 py-0.5 rounded ml-auto">
                      Entrance Test Mandatory
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {college.entranceExamDetails || `Admission requires qualifying scores in recognised entrance exams (e.g. JEE, NEET, CAT, SAT, GRE). Refer to individual course requirements.`}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {[
                  { step: "1", title: "Submit Online Application", desc: "Select your desired course and fill out the direct application form." },
                  { step: "2", title: "Entrance Exam & Merit Evaluation", desc: "Submit valid entrance exam scores (e.g. JEE, NEET, CAT, SAT, IELTS) or qualifying marks." },
                  { step: "3", title: "Counselling & Verification", desc: "Book a counselling session with an advisor to verify documents and confirm eligibility." },
                  { step: "4", title: "Seat Allocation & Enrolment", desc: "Pay the initial course fee to confirm your seat." },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-4 p-4 rounded-xl bg-paper border border-line">
                    <div className="w-8 h-8 rounded-full bg-accent text-primary font-bold flex items-center justify-center shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">{s.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FACILITIES */}
          {activeTab === "facilities" && (
            <div className="bg-white border border-line rounded-2xl p-6 space-y-6">
              <h3 className="font-serif text-lg font-bold text-primary">Campus Facilities &amp; Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {college.facilities?.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-paper border border-line text-xs font-semibold text-primary">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-line rounded-2xl p-6 space-y-6">
              <h3 className="font-serif text-lg font-bold text-primary">Student Reviews</h3>
              {college.reviews?.length === 0 ? (
                <p className="text-xs text-slate-400">No student reviews yet. Be the first to leave a review!</p>
              ) : (
                college.reviews?.map((r: any) => (
                  <div key={r.id} className="border-b border-line pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-xs uppercase">
                          {r.reviewer.name.charAt(0)}
                        </span>
                        <span className="font-bold text-xs text-primary">{r.reviewer.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-3.5 h-3.5 fill-accent" />
                        <span className="text-xs font-bold">{r.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-line pb-3">Take Action</h3>

            <button
              onClick={() => requireAuthForAction("submit your formal application", () => setApplyModalOpen(true))}
              className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" /> Apply Directly
            </button>

            <button
              onClick={() => setEnquiryModalOpen(true)}
              className="w-full bg-primary hover:bg-primary/95 text-secondary font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-accent" /> Send Enquiry
            </button>

            <button
              onClick={() => requireAuthForAction("book a 1-on-1 expert counselling session", () => setCounsellingModalOpen(true))}
              className="w-full bg-paper hover:bg-line/40 border border-line text-primary font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-accent" /> Book Counselling Session
            </button>

            {/* Contact info box */}
            <div className="bg-paper border border-line rounded-xl p-4 space-y-2 text-xs text-slate-600">
              <p className="font-bold text-primary">College Admissions Office</p>
              {college.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {college.email}</p>}
              {college.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {college.phone}</p>}
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent font-bold hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Official Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right Column: Adds Buzz Banner Column (Starts right from top level!) */}
    <AdSidebarColumn page="inner" title="Sponsored Promotions" className="hidden lg:block" />
  </main>

      {/* ── MODAL 1: APPLY NOW ── */}
      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-line rounded-3xl max-w-md w-full p-6 space-y-5 relative shadow-2xl"
            >
              <button onClick={() => setApplyModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-primary">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-primary">Apply to {college.name}</h3>

              {applySuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-primary text-base">Application Submitted!</h4>
                  <p className="text-xs text-slate-500">The college admissions team will review your application and contact you soon.</p>
                  <button onClick={() => { setApplySuccess(false); setApplyModalOpen(false); }} className="bg-primary text-secondary text-xs font-bold px-6 py-2.5 rounded-xl">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {college.courses?.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Course</label>
                      <select
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="w-full border border-line rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:border-accent"
                      >
                        <option value="">-- General Application --</option>
                        {college.courses.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.degree})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text" required
                      value={applyForm.name}
                      onChange={e => setApplyForm({ ...applyForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email" required
                      value={applyForm.email}
                      onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={applyForm.phone}
                      onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Message / Academic Background</label>
                    <textarea
                      rows={3}
                      value={applyForm.message}
                      onChange={e => setApplyForm({ ...applyForm, message: e.target.value })}
                      placeholder="Briefly describe your academic background or questions..."
                      className="w-full border border-line rounded-xl p-3 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applySubmitting}
                    className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {applySubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: SEND ENQUIRY ── */}
      <AnimatePresence>
        {enquiryModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-line rounded-3xl max-w-md w-full p-6 space-y-5 relative shadow-2xl"
            >
              <button onClick={() => setEnquiryModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-primary">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-primary">Send Enquiry to {college.name}</h3>

              {enquirySuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-primary text-base">Enquiry Sent!</h4>
                  <p className="text-xs text-slate-500">The college counsellor will respond to your query shortly.</p>
                  <button onClick={() => { setEnquirySuccess(false); setEnquiryModalOpen(false); }} className="bg-primary text-secondary text-xs font-bold px-6 py-2.5 rounded-xl">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Name</label>
                    <input
                      type="text" required
                      value={enquiryForm.name}
                      onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Email</label>
                    <input
                      type="email" required
                      value={enquiryForm.email}
                      onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={enquiryForm.phone}
                      onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="Enter your phone"
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Message</label>
                    <textarea
                      rows={3} required
                      value={enquiryForm.message}
                      onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="Ask about admissions, fees, hostel, eligibility..."
                      className="w-full border border-line rounded-xl p-3 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {enquirySubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: BOOK COUNSELLING ── */}
      <AnimatePresence>
        {counsellingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-line rounded-3xl max-w-md w-full p-6 space-y-5 relative shadow-2xl"
            >
              <button onClick={() => setCounsellingModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-primary">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-primary">Book Counselling Session</h3>

              {counsellingSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-primary text-base">Counselling Session Requested!</h4>
                  <p className="text-xs text-slate-500">The college advisor will confirm your requested slot soon.</p>
                  <button onClick={() => { setCounsellingSuccess(false); setCounsellingModalOpen(false); }} className="bg-primary text-secondary text-xs font-bold px-6 py-2.5 rounded-xl">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCounselling} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Session Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCounsellingForm({ ...counsellingForm, type: "VIDEO_CALL" })}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          counsellingForm.type === "VIDEO_CALL" ? "bg-accent/10 border-accent text-primary" : "bg-paper border-line text-slate-600"
                        }`}
                      >
                        <Video className="w-4 h-4 text-accent" /> Video Call
                      </button>
                      <button
                        type="button"
                        onClick={() => setCounsellingForm({ ...counsellingForm, type: "IN_PERSON" })}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          counsellingForm.type === "IN_PERSON" ? "bg-accent/10 border-accent text-primary" : "bg-paper border-line text-slate-600"
                        }`}
                      >
                        <Building className="w-4 h-4 text-accent" /> Campus Visit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Preferred Date</label>
                    <input
                      type="date" required
                      value={counsellingForm.date}
                      onChange={e => setCounsellingForm({ ...counsellingForm, date: e.target.value })}
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Slot</label>
                    <select
                      value={counsellingForm.timeSlot}
                      onChange={e => setCounsellingForm({ ...counsellingForm, timeSlot: e.target.value })}
                      className="w-full border border-line rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:border-accent"
                    >
                      <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="12:00 PM">12:00 PM - 01:00 PM</option>
                      <option value="03:00 PM">03:00 PM - 04:00 PM</option>
                      <option value="05:00 PM">05:00 PM - 06:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Additional Notes</label>
                    <textarea
                      rows={2}
                      value={counsellingForm.notes}
                      onChange={e => setCounsellingForm({ ...counsellingForm, notes: e.target.value })}
                      placeholder="What would you like to discuss with the counsellor?"
                      className="w-full border border-line rounded-xl p-3 text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={counsellingSubmitting}
                    className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {counsellingSubmitting ? "Booking..." : "Book Session"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* ── MODAL 4: LOGIN REQUIRED PROMPT ── */}
        {loginModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-line rounded-3xl max-w-md w-full p-6 space-y-6 relative shadow-2xl text-center"
            >
              <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-primary">Account Log In Required</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please log in or create a student account to {loginReason || "access this feature"}.
                </p>
                <div className="pt-1">
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl font-medium inline-block text-left">
                    💡 <strong>Guest inquiries allowed:</strong> Anyone can send general questions using the <strong>Send Enquiry</strong> button!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/auth/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`}
                  className="flex-1 bg-primary hover:bg-primary/95 text-secondary font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition text-center shadow-xs cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href={`/auth/register?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`}
                  className="flex-1 bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition text-center shadow-xs cursor-pointer"
                >
                  Sign Up Free
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
