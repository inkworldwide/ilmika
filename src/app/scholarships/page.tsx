import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { Award, Search, Globe, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function ScholarshipsPage() {
  const scholarships = await prisma.scholarship.findMany({
    include: { country: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1 rounded-full">
            Financial Aid &amp; Grants
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary">Scholarships Worldwide</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Explore thousands of merit-based and need-based scholarships to finance your undergraduate, postgraduate, or doctoral studies.
          </p>
        </div>

        {scholarships.length === 0 ? (
          <div className="bg-white border border-line rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary">No Scholarships Listed Yet</h3>
            <p className="text-sm text-slate-500">Check back soon for new funding opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scholarships.map((s: any) => (
              <div key={s.id} className="bg-white border border-line rounded-3xl p-6 space-y-4 hover:shadow-sm transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <Award className="w-5 h-5" />
                    </div>
                    {s.country && (
                      <span className="text-xs font-mono font-bold text-slate-500 bg-paper border border-line px-2.5 py-1 rounded-full">
                        {s.country.flag || "🌍"} {s.country.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-primary leading-snug">{s.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Provided by: {s.provider}</p>

                  {s.amount && (
                    <div className="bg-paper border border-line rounded-xl p-3">
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Award Amount</p>
                      <p className="font-mono font-bold text-accent text-lg">
                        {s.currency === "INR" ? "₹" : s.currency} {Number(s.amount).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Eligibility Criteria:</p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{s.eligibility}</p>
                  </div>
                </div>

                <div className="border-t border-line pt-4 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {s.deadline ? `Deadline: ${new Date(s.deadline).toLocaleDateString()}` : "Open Year-Round"}
                  </span>
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-1"
                    >
                      Apply <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href="/inquire"
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      Enquire →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
