import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service - ILMIKA",
  description: "Terms of Service and legal agreement for using the ILMIKA global university search platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-5 md:px-8 py-16 space-y-8">
        <div className="bg-white border border-line rounded-3xl p-8 md:p-12 space-y-6 shadow-xs">
          <div className="space-y-2 border-b border-line pb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Legal Policy
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary">Terms of Service</h1>
            <p className="text-xs font-mono text-slate-400">Last updated: August 2026</p>
          </div>

          <div className="space-y-5 text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
            <h2 className="font-serif text-lg font-bold text-primary">1. Agreement to Terms</h2>
            <p>
              By accessing or using ILMIKA ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">2. Use of Educational Services</h2>
            <p>
              ILMIKA provides higher education information, entrance exam cutoff details, college search tools, and scholarship listings. All information is provided for educational guidance and guidance purposes.
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">3. User Responsibilities</h2>
            <p>
              Users agree to provide accurate information when registering, submitting course inquiries, or booking counselling sessions. Misrepresentation of academic qualifications or identity is strictly prohibited.
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">4. Accuracy of Cutoffs &amp; Fees</h2>
            <p>
              While ILMIKA strives to maintain up-to-date college tuition fees and qualifying entrance exam cutoffs, institutional criteria are subject to change by respective universities and examining bodies.
            </p>

            <h2 className="font-serif text-lg font-bold text-primary">5. Contact Information</h2>
            <p>
              For any questions regarding these terms, please contact us at <a href="mailto:info@inkworldwide.in" className="text-accent underline">info@inkworldwide.in</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
