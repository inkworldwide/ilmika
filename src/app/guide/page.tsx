import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Compass,
  GraduationCap,
  BookOpen,
  Award,
  Globe,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Student Guide - ILMIKA",
  description: "Complete step-by-step guide to discovering colleges, entrance exams, cut-off marks, scholarships, and international university admissions.",
};

const GUIDE_STEPS = [
  {
    step: "01",
    title: "Discover Colleges & Degrees",
    subtitle: "Find your ideal stream across 195+ countries",
    desc: "Use our global college search filters to filter by country, degree (Bachelor's, Master's, PhD), study stream (Engineering, Medical, MBA, Law), and annual tuition fees.",
    icon: Compass,
    link: "/colleges",
    btnText: "Explore Colleges",
  },
  {
    step: "02",
    title: "Check Entrance Exams & Cutoffs",
    subtitle: "Understand score requirements for top institutions",
    desc: "Browse required entrance exams (JEE, NEET, CAT, SAT, GRE, GMAT, IELTS, TOEFL, UCAT, TestAS, EJU, Gaokao) along with qualifying cut-off scores and major college rank breakdowns.",
    icon: BookOpen,
    link: "/exams",
    btnText: "View Entrance Exams",
  },
  {
    step: "03",
    title: "Apply for Scholarships",
    subtitle: "Fund your global education with financial aid",
    desc: "Explore merit-based, need-based, and country-specific scholarships. Check eligibility criteria, coverage amounts (partial to 100% full-ride tuition waivers), and application deadlines.",
    icon: Award,
    link: "/scholarships",
    btnText: "Browse Scholarships",
  },
  {
    step: "04",
    title: "Submit Direct Applications",
    subtitle: "Streamlined single-click application portal",
    desc: "Submit your application directly through Ink EduVerse or connect with certified university counselors to verify documents, transcripts, and eligibility criteria.",
    icon: FileCheck,
    link: "/colleges",
    btnText: "Start Application",
  },
];

const FAQS = [
  {
    question: "How do I filter colleges by my annual tuition budget?",
    answer:
      "Go to the Colleges page and use the 'Max Annual Fee' filter sidebar. You can select pre-set limits or choose 'Custom Amount' to enter your exact budget in INR, USD, EUR, GBP, CAD, or AUD.",
  },
  {
    question: "Are entrance exam cut-off scores updated regularly?",
    answer:
      "Yes, our admissions database indexes qualifying cut-off marks and percentile ranges for top colleges worldwide across JEE, NEET, CAT, SAT, GRE, GMAT, IELTS, UCAT, TestAS, and more.",
  },
  {
    question: "What if a country does not require a standardized entrance exam?",
    answer:
      "Many countries admit students directly based on secondary school GPA/transcripts and English language proficiency (IELTS/TOEFL). Our Entrance Exams directory explicitly outlines direct admission guidelines for such destinations.",
  },
  {
    question: "Can I connect with an education advisor for personal guidance?",
    answer:
      "Absolultely! On any college detail page, click 'Book Counselling Session' or 'Send Enquiry' to connect directly with admissions advisors.",
  },
];

export default function StudentGuidePage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="bg-primary text-white py-20 px-5 md:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-white/10 border border-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" /> Admissions Roadmap
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              Complete Student Admissions Guide
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Everything you need to navigate college selection, entrance exam cut-offs, scholarship applications, and global university admissions.
            </p>
          </div>
        </section>

        {/* Steps Grid */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              4 Steps to Your Ideal University
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Follow this step-by-step roadmap to streamline your higher education journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {GUIDE_STEPS.map((s) => {
              const IconComp = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-white border border-line rounded-3xl p-8 space-y-5 hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-serif font-extrabold text-accent bg-accent/10 px-3.5 py-1 rounded-2xl">
                        {s.step}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-secondary border border-line flex items-center justify-center text-primary">
                        <IconComp className="w-6 h-6 text-accent" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary">{s.title}</h3>
                      <p className="text-xs font-mono font-bold text-accent mt-0.5">{s.subtitle}</p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-line">
                    <Link
                      href={s.link}
                      className="text-xs font-bold text-primary hover:text-accent flex items-center justify-between font-mono uppercase tracking-wider group"
                    >
                      <span>{s.btnText}</span>
                      <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white border-t border-line py-16 px-5 md:px-8">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1 rounded-full">
                Help &amp; Answers
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary flex items-center justify-center gap-2">
                <HelpCircle className="w-7 h-7 text-accent" /> Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-secondary border border-line rounded-2xl p-6 space-y-2"
                >
                  <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium pl-4">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            {/* Need More Assistance */}
            <div className="bg-primary rounded-3xl p-8 text-center text-white space-y-4 shadow-xl">
              <h3 className="font-serif text-2xl font-bold">Have More Questions?</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
                Our support team and certified education advisors are here to guide you through your admissions journey.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-md"
                >
                  Contact Admissions Advisor
                </Link>
                <Link
                  href="/contact?type=feedback"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider border border-white/20 transition inline-flex items-center gap-1.5"
                >
                  Submit Feedback
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
