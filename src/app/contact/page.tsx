"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      type: "Contact",
      name: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
      phone: formData.get("phone"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      setStatus("success");
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Parallax/Gradient effect */}
        <div className="relative bg-primary pt-32 pb-40 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-3xl opacity-50 transform rotate-12"></div>
            <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-3xl opacity-30 transform -rotate-12"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-5 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-accent text-sm font-semibold mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>We're Here to Help</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Get in Touch with Us
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Whether you're looking for your dream home or a lucrative investment, our team of experts is ready to guide you every step of the way.
            </p>
          </div>
        </div>

        {/* Contact Content - Overlapping the Hero */}
        <div className="max-w-7xl mx-auto px-5 relative z-20 -mt-24 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Contact Information Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Main Office Card */}
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-line/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-accent transition-colors duration-300 shadow-sm">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-2xl text-primary mb-3 font-serif">Headquarters</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  123 Business Avenue, Tower B<br />
                  Cyber City, Phase 2<br />
                  Mumbai, Maharashtra 400001
                </p>
              </div>

              {/* Grid for other info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-line/50 hover:border-accent/30 transition-colors group">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">Call Us</h3>
                  <p className="text-slate-500 text-sm mb-1">+91 98765 43210</p>
                  <p className="text-slate-500 text-sm">+91 98765 43211</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-line/50 hover:border-accent/30 transition-colors group">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">Email Us</h3>
                  <a href="mailto:info@reonestoppage.com" className="text-slate-500 text-sm mb-1 hover:text-accent transition-colors block truncate">info@reonestoppage.com</a>
                  <a href="mailto:support@reonestoppage.com" className="text-slate-500 text-sm hover:text-accent transition-colors block truncate">support@reonestoppage.com</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.07)] border border-line/40">
              <h2 className="font-serif text-3xl font-bold text-primary mb-2">Send a Message</h2>
              <p className="text-slate-500 mb-8">Fill out the form below and we will get back to you within 24 hours.</p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                {status === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    Your message has been sent to our support team!
                  </div>
                )}
                {status === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {errorMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                    <input 
                      required
                      name="firstName"
                      type="text" 
                      className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50" 
                      placeholder="John" 
                    />
                  </div>
                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                    <input 
                      required
                      name="lastName"
                      type="text" 
                      className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                    <input 
                      required
                      name="email"
                      type="email" 
                      className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50" 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                    <input 
                      required
                      name="phone"
                      type="tel" 
                      maxLength={10}
                      onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10); }}
                      className="w-full px-5 py-4 rounded-xl border border-line/60 focus:border-accent outline-none transition-all bg-slate-50/50 hover:bg-slate-50" 
                      placeholder="9876543210" 
                    />
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">How can we help?</label>
                  <textarea 
                    required
                    name="message"
                    rows={4} 
                    className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50 resize-none" 
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>
                
                <button disabled={status === "loading"} type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70">
                  <span>{status === "loading" ? "Sending..." : "Send Message"}</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
