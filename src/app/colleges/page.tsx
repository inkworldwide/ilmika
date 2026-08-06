import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollegesSearchContent from "@/components/property/CollegesSearchContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Colleges & Courses Worldwide",
  description: "Filter and compare 12,000+ colleges across 180+ countries. Search by stream, degree, country, fees, and more.",
};

export default function CollegesPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
        <CollegesSearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
