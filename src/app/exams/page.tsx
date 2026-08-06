import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 py-12 space-y-8">
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
      </main>

      <Footer />
    </div>
  );
}
