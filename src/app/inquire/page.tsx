"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, GraduationCap, ShieldCheck, Search, HeadphonesIcon, ClipboardList, MapPin, BookOpen } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function InquireFormContent() {
  const searchParams = useSearchParams();

  const [degree, setDegree] = useState("BACHELOR");
  const [stream, setStream] = useState("ENGINEERING");
  const [country, setCountry] = useState("IN");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    const purposeVal = searchParams.get("purpose") || "";
    if (purposeVal.toLowerCase().includes("postgraduate") || purposeVal.toLowerCase().includes("master")) setDegree("MASTER");
    else if (purposeVal.toLowerCase().includes("phd")) setDegree("PHD");
    else if (purposeVal.toLowerCase().includes("diploma")) setDegree("DIPLOMA");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      type: "Study Requirement",
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      degree,
      stream,
      country,
      budget: formData.get("budget"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit requirement");
      
      setStatus("success");
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Column - Form */}
      <div className="lg:col-span-8 bg-white rounded-[2rem] border border-line shadow-[0_20px_50px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent" />
        
        <form className="p-8 md:p-12" onSubmit={handleSubmit}>
          {status === "success" && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold">
              ✓ Your study requirement has been successfully submitted! Our education advisors will match you with top colleges.
            </div>
          )}
          {status === "error" && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}
          {/* Section 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-2xl font-bold text-primary font-serif">Student Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                <input required name="name" type="text" className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-slate-50/50" placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                <input required name="phone" type="tel" className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-slate-50/50" placeholder="+1 234 567 8900" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-slate-50/50" placeholder="jane@example.com" />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-line mb-10" />

          {/* Section 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-2xl font-bold text-primary font-serif">Study Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Degree</label>
                <select 
                  value={degree} 
                  onChange={(e) => setDegree(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="BACHELOR">Bachelor's Degree</option>
                  <option value="MASTER">Master's Degree (MBA/MS)</option>
                  <option value="PHD">PhD / Doctorate</option>
                  <option value="DIPLOMA">Diploma Programme</option>
                  <option value="CERTIFICATE">Short Certificate</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Stream</label>
                <select 
                  value={stream} 
                  onChange={(e) => setStream(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="ENGINEERING">Engineering &amp; Technology</option>
                  <option value="MEDICAL">Medical &amp; Health Sciences</option>
                  <option value="MANAGEMENT">Business &amp; Management</option>
                  <option value="LAW">Law &amp; Legal Studies</option>
                  <option value="ARTS">Arts &amp; Humanities</option>
                  <option value="COMMERCE">Commerce &amp; Finance</option>
                  <option value="SCIENCE">Science &amp; Research</option>
                  <option value="DESIGN">Design &amp; Architecture</option>
                  <option value="INFORMATION_TECHNOLOGY">IT &amp; Computing</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Destination</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="IN">🇮🇳 India</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="ANY">🌍 Any / Open to Suggestions</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Budget</label>
                <input 
                  name="budget" 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-accent outline-none text-sm bg-slate-50/50" 
                  placeholder="e.g. ₹5 Lakhs/yr or $30,000/yr" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Requirements / Academic Record</label>
                <textarea name="message" rows={4} className="w-full p-4 rounded-xl border border-line focus:border-accent outline-none text-sm bg-slate-50/50 resize-none" placeholder="Include exam scores (IELTS, SAT, JEE, GRE) or specific career goals..."></textarea>
              </div>
            </div>
          </div>

          <button disabled={status === "loading"} type="submit" className="w-full bg-accent text-primary font-bold py-4 rounded-xl hover:bg-accent-hover transition flex items-center justify-center gap-2 group text-sm uppercase tracking-wider cursor-pointer disabled:opacity-70">
            <Send className="w-4 h-4" /> 
            <span>{status === "loading" ? "Submitting..." : "Submit Study Requirement"}</span>
          </button>
        </form>
      </div>

      {/* Right Column - Info */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
        <div className="bg-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <h3 className="font-serif text-2xl font-bold mb-2">Why Post Requirement?</h3>
          <p className="text-slate-300 mb-8 text-xs leading-relaxed">Skip browsing hundreds of websites — get matched directly with colleges and counsellors.</p>
          
          <div className="space-y-6 text-left">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-0.5">Tailored Course Matching</h4>
                <p className="text-xs text-slate-400">Receive options matching your exact stream, budget, and location.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-0.5">Verified Institutions</h4>
                <p className="text-xs text-slate-400">Only accredited universities and colleges will reach out.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <HeadphonesIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-0.5">Free Counselling</h4>
                <p className="text-xs text-slate-400">Get guidance on admissions, visas, and scholarships.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-line flex flex-col items-center text-center shadow-xs">
          <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-accent" />
          </div>
          <h4 className="font-bold text-primary text-base mb-1">Represent a College?</h4>
          <p className="text-slate-500 mb-4 text-xs">List your institution with us and reach prospective students globally.</p>
          <Link href="/colleges/add" className="w-full block text-center py-2.5 px-4 rounded-xl border border-primary text-primary font-bold text-xs hover:bg-primary hover:text-white transition">
            List Your College Free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InquirePage() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-5">
          {/* Header Area */}
          <div className="text-center mb-12 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
              <Search className="w-3.5 h-3.5" /> Custom Requirement
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight">
              Find Your <span className="text-accent italic">Ideal</span> Programme.
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Tell us your academic background, preferred country, and budget. Our advisors will handpick the best options for you.
            </p>
          </div>

          <Suspense fallback={<div className="p-8 text-center text-slate-400 font-semibold">Loading form...</div>}>
            <InquireFormContent />
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
