import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";
import { prisma } from "@/lib/prisma";
import ExamsSearchContent from "@/components/exams/ExamsSearchContent";

export const revalidate = 60;

export default async function ExamsPage() {
  const rawExams = await prisma.entranceExam.findMany({
    include: { country: true },
    orderBy: { name: "asc" },
  });

  const serializedExams = rawExams.map((e) => ({
    id: e.id,
    name: e.name,
    fullName: e.fullName,
    stream: e.stream,
    conductedBy: e.conductedBy,
    frequency: e.frequency,
    website: e.website,
    cutoffScore: e.cutoffScore,
    acceptedCutoffs: e.acceptedCutoffs,
    country: e.country ? {
      id: e.country.id,
      name: e.country.name,
      code: e.country.code,
      flag: e.country.flag,
    } : null,
  }));

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left Column: Exams Content */}
        <div className="space-y-8 min-w-0">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1 rounded-full">
              Admissions &amp; Testing
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary">Entrance Exams Directory</h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Search national and international entrance exams (JEE, NEET, CAT, SAT, IELTS, GRE, GMAT, UCAT, TestAS, EJU) with college cut-off marks worldwide.
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-12 text-sm text-slate-400">Loading entrance exams...</div>}>
            <ExamsSearchContent initialExams={serializedExams} />
          </Suspense>
        </div>

        {/* Right Column: Adds Buzz Banner Column */}
        <AdSidebarColumn page="exams" title="Testing Promotions" className="hidden lg:block" />
      </main>

      <Footer />
    </div>
  );
}
