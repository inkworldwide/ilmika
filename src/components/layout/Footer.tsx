"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Send, ArrowRight } from "lucide-react";
import { Logo } from "../ui/Logo";

// Custom inline SVG icons
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-b from-slate-950 via-[#0B132B] to-[#060C1B] text-slate-300 border-t border-slate-800/80">
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-[1.3fr_2fr] gap-12 lg:gap-16">
        {/* Left Column: Brand & Newsletter */}
        <div className="space-y-6">
          <Logo theme="dark" />
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed tracking-wide">
            The world's premier platform for discovering and comparing colleges &amp; courses across every country. Your Gateway to Global Education.
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent" /> Get Weekly College Alerts
            </h4>
            {submitted ? (
              <p className="text-xs text-emerald-400 font-medium bg-emerald-950/50 border border-emerald-800/60 px-3.5 py-2.5 rounded-xl">
                ✓ Thank you! You have been subscribed to weekly college alerts.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-sm">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-28 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-accent hover:bg-accent-hover text-primary font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  aria-label="Subscribe"
                >
                  Subscribe <Send className="w-3 h-3" />
                </button>
              </form>
            )}
            <p className="text-[11px] text-slate-500">No spam. Unsubscribe with one click anytime.</p>
          </div>
        </div>

        {/* Right Column: Menu links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span> Explore
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li><Link href="/colleges?degree=BACHELOR" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Bachelor's Programmes</Link></li>
              <li><Link href="/colleges?degree=MASTER" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Master's Programmes</Link></li>
              <li><Link href="/colleges?degree=PHD" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">PhD / Doctorate</Link></li>
              <li><Link href="/colleges?mode=ONLINE" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Online & Distance</Link></li>
              <li><Link href="/scholarships" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Scholarships</Link></li>
              <li><Link href="/exams" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Entrance Exams</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span> Top Countries
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li><Link href="/colleges?country=IN" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">🇮🇳 India</Link></li>
              <li><Link href="/colleges?country=US" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">🇺🇸 United States</Link></li>
              <li><Link href="/colleges?country=GB" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">🇬🇧 United Kingdom</Link></li>
              <li><Link href="/colleges?country=AU" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">🇦🇺 Australia</Link></li>
              <li><Link href="/colleges?country=CA" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">🇨🇦 Canada</Link></li>
              <li>
                <Link href="/colleges" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover tracking-wide pt-1.5 hover:translate-x-1 transition-all transform group">
                  <span>All Countries</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span> Support
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li><Link href="/guide" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Student Guide</Link></li>
              <li><Link href="/help" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Privacy Policy</Link></li>
              <li><Link href="/contact?type=feedback" className="hover:text-white hover:translate-x-1 transition-all transform duration-150 inline-block">Submit Feedback</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} <span className="text-slate-300 font-semibold font-serif uppercase tracking-wider">Ilmika</span>. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Instagram" className="hover:text-accent hover:scale-110 transition-all transform"><InstagramIcon className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-accent hover:scale-110 transition-all transform"><TwitterIcon className="w-4 h-4" /></a>
            <a href="#" aria-label="Linkedin" className="hover:text-accent hover:scale-110 transition-all transform"><LinkedinIcon className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
