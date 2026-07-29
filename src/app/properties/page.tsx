import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchContent from "@/components/property/SearchContent";

export const metadata = {
  title: "Search Properties | Re One Stop Page",
  description: "Find the best residential apartments, houses, villas, PGs, and commercial spaces to rent, buy, or lease in India.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      
      {/* Wrapped in Suspense to resolve Next.js build-time SearchParams optimization warning */}
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="font-serif text-lg text-primary">Loading available listings...</p>
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>

      <Footer />
    </div>
  );
}
