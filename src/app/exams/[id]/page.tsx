import React from "react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, Globe, Landmark, ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ExamDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailProps) {
  const { id } = await params;

  const exam = await prisma.entranceExam.findUnique({
    where: { id },
    include: { country: true },
  });

  if (!exam) {
    notFound();
  }

  // Find colleges accepting this entrance exam or matching stream
  const acceptingColleges = await prisma.college.findMany({
    where: {
      status: "ACTIVE",
      courses: {
        some: {
          entranceExams: {
            has: exam.name,
          },
        },
      },
    },
    include: {
      city: true,
      country: true,
      images: { take: 1 },
    },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 md:px-8 py-12 space-y-8 text-left">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-accent font-mono uppercase">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Hero Card */}
        <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-2xl bg-primary text-accent flex items-center justify-center font-bold text-lg border border-line">
                {exam.name.slice(0, 4)}
              </span>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">{exam.name}</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold">{exam.fullName}</p>
              </div>
            </div>
            {exam.stream && (
              <span className="text-xs font-mono font-bold uppercase text-accent bg-accent/15 px-3 py-1.5 rounded-full border border-accent/25">
                {exam.stream.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="border-t border-line pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Conducted By</p>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-accent" /> {exam.conductedBy || "National Agency"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Frequency</p>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent" /> {exam.frequency || "Once a Year"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Scope</p>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-accent" /> {exam.country?.name || "Global"}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-xl font-bold text-primary border-b border-line pb-3">About the Examination</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {exam.description || "Detailed entrance exam syllabus, preparation guides, registration criteria, and schedule updates will be released shortly by the board. Candidates are advised to check the official website for verified timelines."}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-line rounded-3xl p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-primary">Official Links</h3>
              {exam.website ? (
                <a
                  href={exam.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary hover:bg-slate-800 text-secondary text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 border border-line"
                >
                  <Globe className="w-4 h-4 text-accent" />
                  <span>Go to Official Site ↗</span>
                </a>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Official link not listed.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-950 to-primary text-white border border-slate-800 rounded-3xl p-6 space-y-3.5">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-accent" /> Need Prep Help?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Connect with our expert international advisors to guide you through registration, eligibility, and accepting university applications.
              </p>
              <Link
                href="/inquire"
                className="w-full bg-accent hover:bg-accent-hover text-primary text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>Book Counselling Session</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Accepting Colleges */}
        {acceptingColleges.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-primary">Accepting Colleges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {acceptingColleges.map((c) => {
                const imgUrl = c.images && c.images.length > 0
                  ? c.images[0].url
                  : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80";
                return (
                  <Link
                    key={c.id}
                    href={`/colleges/${c.id}`}
                    className="bg-white border border-line rounded-2xl overflow-hidden hover:shadow-sm transition flex flex-col group"
                  >
                    <img src={imgUrl} alt={c.name} className="aspect-video object-cover w-full group-hover:scale-[1.02] transition duration-300" />
                    <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-primary group-hover:text-accent transition line-clamp-1">{c.name}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{c.city?.name}, {c.country?.name}</p>
                      </div>
                      <span className="text-[10px] text-accent font-bold mt-2 inline-flex items-center gap-1 font-mono uppercase">
                        View College →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
