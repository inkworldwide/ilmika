import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { HelpCircle, Search, Mail, MessageSquare, Phone, ArrowRight, ShieldCheck, BookOpen, Compass } from "lucide-react";

export const metadata = {
  title: "Help Center - Ink EduVerse",
  description: "Get help with college search, admissions, entrance exams, scholarship applications, and user accounts on Ink EduVerse.",
};

const HELP_CATEGORIES = [
  {
    title: "Searching Colleges & Courses",
    desc: "How to use filters for degrees, streams, annual fees, and 195+ global countries.",
    link: "/colleges",
  },
  {
    title: "Entrance Exams & Cutoffs",
    desc: "Understanding qualifying marks, college cutoffs, and direct admission guidelines.",
    link: "/exams",
  },
  {
    title: "Scholarships & Financial Aid",
    desc: "Finding merit and need-based tuition waivers across worldwide universities.",
    link: "/scholarships",
  },
  {
    title: "Direct Applications & Counselling",
    desc: "Submitting course applications and scheduling one-on-one advisor counselling.",
    link: "/guide",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary text-white py-16 px-5 md:px-8 text-center space-y-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> Support &amp; Knowledge Base
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold">Ink EduVerse Help Center</h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto font-medium">
              Have questions about college applications, scholarships, or entrance exam cutoffs? We're here to help.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HELP_CATEGORIES.map((cat, idx) => (
              <Link
                key={idx}
                href={cat.link}
                className="bg-white border border-line rounded-3xl p-6 space-y-3 hover:border-accent/40 transition hover:shadow-md group block"
              >
                <h3 className="font-serif text-lg font-bold text-primary flex items-center justify-between">
                  <span>{cat.title}</span>
                  <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Contact Support Options */}
          <div className="bg-white border border-line rounded-3xl p-8 space-y-6 text-center max-w-2xl mx-auto shadow-xs">
            <h3 className="font-serif text-2xl font-bold text-primary">Still need assistance?</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Reach out directly to our student support desk or submit your feedback.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-6 py-3 bg-accent text-primary font-bold text-xs rounded-xl hover:bg-accent-hover transition inline-flex items-center gap-2 shadow-xs"
              >
                <Mail className="w-4 h-4" /> Contact Support Desk
              </Link>
              <Link
                href="/contact?type=feedback"
                className="px-6 py-3 bg-secondary text-primary border border-line font-bold text-xs rounded-xl hover:bg-slate-200 transition inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-accent" /> Submit Feedback
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
