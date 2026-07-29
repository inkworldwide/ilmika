"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Mail, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset email.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Building2 className="w-8 h-8 text-accent" />
            <span className="font-serif text-2xl font-bold text-primary tracking-tight">Re One Stop Page</span>
          </Link>
        </div>

        <div className="bg-white border border-line rounded-2xl shadow-sm p-8 space-y-6">
          {success ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="font-serif text-lg font-bold text-primary">Check your inbox</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link href="/auth/login" className="block mt-2 text-xs font-bold text-accent hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h1 className="font-serif text-xl font-bold text-primary">Reset your password</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400">
                Remembered it?{" "}
                <Link href="/auth/login" className="text-accent font-bold hover:underline">Sign in</Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-300 mt-6">
          <Link href="/" className="hover:text-accent transition">← Back to Homepage</Link>
        </p>
      </div>
    </div>
  );
}
