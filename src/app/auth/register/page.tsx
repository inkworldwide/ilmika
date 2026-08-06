"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, User, Phone, ChevronDown, MapPin, Globe } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import SearchableCountrySelect from "@/components/ui/SearchableCountrySelect";

const ROLES = [
  { value: "USER", label: "Student / Applicant" },
  { value: "COLLEGE_ADMIN", label: "College Administrator" },
  { value: "AGENT", label: "Education Advisor / Agent" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    city: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.phone || form.phone.trim().length < 5) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!form.country) {
      setError("Please select your country.");
      return;
    }
    if (!form.city || form.city.trim().length < 2) {
      setError("Please enter your city.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 border border-line rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-bold text-2xl">
            ✓
          </div>
          <h2 className="font-serif text-xl font-bold text-primary">Account Created!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">Welcome to ILMIKA. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white border border-line rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <h1 className="font-serif text-xl font-bold text-primary">Create your ILMIKA account</h1>
            <p className="text-xs text-slate-400 mt-1">Join thousands of students and college administrators worldwide</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Country *</label>
                <SearchableCountrySelect
                  value={form.country}
                  onChange={(code) => setForm(p => ({ ...p, country: code }))}
                  placeholder="Select Country"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Mumbai"
                    className="w-full pl-9 pr-3 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">I am a…</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={form.role}
                  onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-line rounded-xl text-sm bg-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition cursor-pointer"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-slate-800 text-secondary py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6">
          <Link href="/" className="hover:text-accent transition">← Back to Homepage</Link>
        </p>
      </div>
    </div>
  );
}
