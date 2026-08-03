"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Mail, Send, MessageSquare, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/* ─────────────────────────────────────────
   Animated Popup Toast
───────────────────────────────────────── */
function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss after 5 s
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center px-4 pt-6">
      <div
        className={`
          pointer-events-auto w-full max-w-md
          transition-all duration-500 ease-out
          ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-8 scale-95"}
        `}
      >
        <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${isSuccess ? "bg-white border-green-200" : "bg-white border-red-200"}`}>

          {/* Coloured top accent bar */}
          <div className={`h-1.5 w-full ${isSuccess ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} />

          {/* Shrinking progress bar */}
          <div className="h-0.5 bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${isSuccess ? "bg-green-300" : "bg-red-300"}`}
              style={{ animation: "toastShrink 5s linear forwards" }}
            />
          </div>

          <div className="flex items-start gap-4 p-5">
            {/* Icon */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${isSuccess ? "bg-green-50" : "bg-red-50"}`}>
              {isSuccess
                ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                : <AlertCircle className="w-6 h-6 text-red-500" />}
            </div>

            {/* Text */}
            <div className="flex-1 pt-0.5 min-w-0">
              <p className={`font-bold text-sm ${isSuccess ? "text-green-700" : "text-red-700"}`}>
                {isSuccess ? "Message Received!" : "Oops, something went wrong"}
              </p>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">{message}</p>
            </div>

            {/* Close */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 cursor-pointer mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Form
───────────────────────────────────────── */
function ContactFormContent() {
  const searchParams = useSearchParams();
  const isFeedbackMode = searchParams.get("type") === "feedback";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      type: isFeedbackMode ? "Feedback" : "Contact",
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
      setShowToast(true);
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  const successMsg = isFeedbackMode
    ? "Your thoughts have reached our team! We genuinely read every word — your feedback directly shapes how we improve RE OneStopPage for thousands of users."
    : "Your message has landed safely with us. Our support team will reach out to you within 24 hours. We look forward to connecting with you!";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Popup Toast */}
      {showToast && (
        <Toast
          type={status === "success" ? "success" : "error"}
          message={status === "success" ? successMsg : errorMessage}
          onClose={() => {
            setShowToast(false);
            if (status === "success") setStatus("idle");
          }}
        />
      )}

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-primary pt-32 pb-40 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-3xl opacity-50 transform rotate-12"></div>
            <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-3xl opacity-30 transform -rotate-12"></div>
          </div>

          <div className="max-w-7xl mx-auto px-5 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-accent text-sm font-semibold mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>{isFeedbackMode ? "We Value Your Feedback" : "We're Here to Help"}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {isFeedbackMode ? "Share Your Feedback" : "Get in Touch with Us"}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {isFeedbackMode
                ? "Help us improve RE Onestoppage. Share your ideas, suggestions, or user experience feedback."
                : "Whether you're looking for your dream home or a lucrative investment, our team of experts is ready to guide you every step of the way."}
            </p>
          </div>
        </div>

        {/* Contact Content */}
        <div className="max-w-7xl mx-auto px-5 relative z-20 -mt-24 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-line/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-accent transition-colors duration-300 shadow-sm">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-2xl text-primary mb-3 font-serif">Headquarters</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  #127, 6th B Cross Road<br />
                  RMV Stage 2, Sanjay Nagar<br />
                  Bangalore 560094
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-line/50 hover:border-accent/30 transition-colors group">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">Call Us</h3>
                  <p className="text-slate-500 text-sm mb-1">+91 9900167168</p>
                  <p className="text-slate-500 text-sm">+91 9964381417</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-line/50 hover:border-accent/30 transition-colors group">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">Email Us</h3>
                  <a href="mailto:info@inkworldwide.in" className="text-slate-500 text-sm mb-1 hover:text-accent transition-colors block truncate">info@inkworldwide.in</a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.07)] border border-line/40">
              <h2 className="font-serif text-3xl font-bold text-primary mb-2">
                {isFeedbackMode ? "Submit Your Feedback" : "Send a Message"}
              </h2>
              <p className="text-slate-500 mb-8">
                {isFeedbackMode
                  ? "We read all user suggestions to improve our platform experience."
                  : "Fill out the form below and we will get back to you within 24 hours."}
              </p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                    <input
                      required
                      name="firstName"
                      type="text"
                      className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                      required
                      name="email"
                      type="email"
                      className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    {isFeedbackMode ? "Your Feedback / Suggestion" : "How can we help?"}
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl border-2 border-line/60 focus:border-primary outline-none transition-all bg-slate-50/50 hover:bg-slate-50 resize-none"
                    placeholder={isFeedbackMode ? "Share your feedback or suggestions with us..." : "Tell us about your requirements..."}
                  ></textarea>
                </div>

                <button
                  disabled={status === "loading"}
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                >
                  <span>{status === "loading" ? "Sending..." : isFeedbackMode ? "Submit Feedback" : "Send Contact Message"}</span>
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-mono">Loading form...</div>}>
      <ContactFormContent />
    </Suspense>
  );
}
