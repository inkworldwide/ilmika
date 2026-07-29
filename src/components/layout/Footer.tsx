"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { Logo } from "../ui/Logo";

// Custom inline SVG icons to prevent lucide-react brand icon compile warnings under Turbopack
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
    <footer className="bg-primary text-secondary/80 border-t border-line/10">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-12">
        {/* Left Column: Brand & Newsletter */}
        <div className="space-y-6">
          <Logo theme="dark" />
          <p className="text-sm text-secondary/80 max-w-sm leading-relaxed">
            Verified property listings, zero brokerage hassles, and a digitized leasing process designed for modern India.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">Get Weekly Property Alerts</h4>
            {submitted ? (
              <p className="text-xs text-accent font-medium">Thank you! You have been subscribed to our weekly newsletter.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex keytag keytag-dark bg-slate-900 border border-slate-800 pl-4 pr-1.5 py-1.5 max-w-xs rounded-xl">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="flex-1 bg-transparent text-secondary placeholder:text-secondary/50 text-[14px] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-primary p-2 rounded-lg transition shrink-0 cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[11px] text-secondary/60">No spam, unsubscribe anytime.</p>
          </div>
        </div>

        {/* Right Column: Menu links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-serif text-sm font-semibold text-secondary mb-4 tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-secondary/80">
              <li><Link href="/properties?transactionType=RENT" className="hover:text-white transition">Rent</Link></li>
              <li><Link href="/properties?transactionType=SALE" className="hover:text-white transition">Buy</Link></li>
              <li><Link href="/properties?transactionType=LEASE" className="hover:text-white transition">Lease</Link></li>
              <li><Link href="/properties?propertyType=OFFICE_SPACE" className="hover:text-white transition">Commercial</Link></li>
              <li><Link href="/properties?propertyType=PG" className="hover:text-white transition">PG/Co-living</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold text-secondary mb-4 tracking-wider">Cities</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-secondary/80">
              <Link href="/properties?citySearch=bengaluru" className="hover:text-white transition">Bengaluru</Link>
              <Link href="/properties?citySearch=mumbai" className="hover:text-white transition">Mumbai</Link>
              <Link href="/properties?citySearch=delhi" className="hover:text-white transition">Delhi NCR</Link>
              <Link href="/properties?citySearch=hyderabad" className="hover:text-white transition">Hyderabad</Link>
              <Link href="/properties?citySearch=chennai" className="hover:text-white transition">Chennai</Link>
              <Link href="/properties?citySearch=pune" className="hover:text-white transition">Pune</Link>
              <Link href="/properties?citySearch=kolkata" className="hover:text-white transition">Kolkata</Link>
              <Link href="/properties?citySearch=ahmedabad" className="hover:text-white transition">Ahmedabad</Link>
              <Link href="/properties?citySearch=gurugram" className="hover:text-white transition">Gurugram</Link>
              <Link href="/properties?citySearch=noida" className="hover:text-white transition">Noida</Link>
              <Link href="/properties?citySearch=kochi" className="hover:text-white transition">Kochi</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold text-secondary mb-4 tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-secondary/80">
              <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">RERA Guidelines</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Submit Feedback</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-secondary/10 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary/60">
          <p>© {new Date().getFullYear()} Re One Stop Page. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Instagram" className="hover:text-secondary transition"><InstagramIcon className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-secondary transition"><TwitterIcon className="w-4 h-4" /></a>
            <a href="#" aria-label="Linkedin" className="hover:text-secondary transition"><LinkedinIcon className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
