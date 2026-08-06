import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Lock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - ILMIKA",
  description: "Privacy Policy outlining how student data is protected and managed on ILMIKA.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-5 md:px-8 py-16 space-y-8">
        <div className="bg-white border border-line rounded-3xl p-8 md:p-12 space-y-6 shadow-xs">
          <div className="space-y-2 border-b border-line pb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Data Protection
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary">Privacy Policy</h1>
            <p className="text-xs font-mono text-slate-400">Last updated: August 2026</p>
          </div>

          <div className="space-y-5 text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
            <h2 className="font-serif text-lg font-bold text-primary">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when registering an account, submitting college inquiries, applying for scholarships, or booking counselling sessions (such as name, email, phone number, and academic preferences).
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">2. How We Use Information</h2>
            <p>
              Your information is used to facilitate university counselling, process direct application inquiries, send relevant college alerts, and improve user experience across ILMIKA.
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">3. Data Security &amp; Sharing</h2>
            <p>
              We do not sell user personal data. Information submitted for college applications is shared strictly with authorized university admissions offices and certified counselors.
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">4. Your Privacy Rights</h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data at any time by contacting <a href="mailto:info@inkworldwide.in" className="text-accent underline">info@inkworldwide.in</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
