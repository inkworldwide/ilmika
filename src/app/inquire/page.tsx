"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, Building, ShieldCheck, Search, HeadphonesIcon, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function InquirePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      type: "Inquiry",
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      purpose: formData.get("purpose"),
      propertyType: formData.get("propertyType"),
      city: formData.get("city"),
      budget: formData.get("budget"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit inquiry");
      
      setStatus("success");
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-5">
          {/* Header Area */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold mb-6 uppercase tracking-widest">
              <Search className="w-4 h-4" />
              Property Inquiry
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              Let our experts find your <span className="text-accent italic">perfect</span> match.
            </h1>
            <p className="text-lg text-slate-500">
              Tell us exactly what you're looking for, and our dedicated team will handpick the best options that meet your unique requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column - Form */}
            <div className="lg:col-span-8 bg-white rounded-[2rem] border border-line shadow-[0_20px_50px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent"></div>
              
              <form className="p-8 md:p-12" onSubmit={handleSubmit}>
                {status === "success" && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    Your inquiry has been successfully sent to our team!
                  </div>
                )}
                {status === "error" && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {errorMessage}
                  </div>
                )}
                {/* Section 1 */}
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-lg">1</div>
                    <h3 className="text-2xl font-bold text-primary font-serif">Personal Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                      <input required name="name" type="text" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                      <input required name="phone" type="tel" maxLength={10} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10); }} className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="9876543210" />
                    </div>
                    <div className="space-y-2 md:col-span-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                      <input required name="email" type="email" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="john@example.com" />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-line/60 mb-12"></div>

                {/* Section 2 */}
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-lg">2</div>
                    <h3 className="text-2xl font-bold text-primary font-serif">Property Requirements</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Purpose</label>
                      <select name="purpose" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 text-slate-700 cursor-pointer appearance-none">
                        <option>Buying</option>
                        <option>Renting</option>
                        <option>Leasing</option>
                      </select>
                    </div>
                    <div className="space-y-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Property Type</label>
                      <select name="propertyType" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 text-slate-700 cursor-pointer appearance-none">
                        <option>House / Apartment</option>
                        <option>Commercial Space</option>
                        <option>Industrial Building</option>
                        <option>Land / Plot</option>
                        <option>PG / Co-living</option>
                      </select>
                    </div>
                    <div className="space-y-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Preferred City</label>
                      <input required name="city" type="text" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" placeholder="e.g. Mumbai" />
                    </div>
                    <div className="space-y-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Budget Range</label>
                      <select name="budget" className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 text-slate-700 cursor-pointer appearance-none">
                        <option>Under ₹50 Lacs</option>
                        <option>₹50 Lacs - ₹1 Cr</option>
                        <option>₹1 Cr - ₹5 Cr</option>
                        <option>Above ₹5 Cr</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2 relative group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Additional Requirements</label>
                      <textarea name="message" rows={4} className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50 resize-none" placeholder="Describe any specific needs, amenities, or timelines..."></textarea>
                    </div>
                  </div>
                </div>

                <button disabled={status === "loading"} type="submit" className="w-full bg-accent text-primary font-bold py-5 rounded-xl hover:bg-accent/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group text-lg disabled:opacity-70">
                  <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> 
                  <span>{status === "loading" ? "Submitting..." : "Submit Inquiry"}</span>
                </button>
              </form>
            </div>

            {/* Right Column - Info */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
              <div className="bg-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-serif text-2xl font-bold mb-2">Why Inquire?</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">Our premium concierge service helps you skip the scrolling and get directly to properties that matter.</p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Tailored Matches</h4>
                      <p className="text-sm text-slate-400">Get properties that exactly match your criteria.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Verified Listings</h4>
                      <p className="text-sm text-slate-400">100% verified properties and owners.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <HeadphonesIcon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Expert Advice</h4>
                      <p className="text-sm text-slate-400">Dedicated relationship manager for guidance.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-line flex flex-col items-center text-center shadow-sm">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="w-8 h-8 text-accent" />
                </div>
                <h4 className="font-bold text-primary text-xl mb-2">Are you a property owner?</h4>
                <p className="text-slate-500 mb-6 text-sm">List your property with us and reach thousands of verified buyers and tenants.</p>
                {authLoading ? (
                  <div className="w-full text-center py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-400 font-bold">
                    Loading...
                  </div>
                ) : user ? (
                  <Link href="/properties/add" className="w-full block text-center py-3 px-6 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                    List Property Free
                  </Link>
                ) : (
                  <Link href="/auth/login" className="w-full block text-center py-3 px-6 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                    Login to List Property
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
