"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, Phone, Award, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function DashboardProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    avatar: "",
    companyName: "",
    experienceYears: 0,
    bio: "",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/dashboard/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setForm({
            name: data.profile.name || "",
            phone: data.profile.phone || "",
            avatar: data.profile.avatar || "",
            companyName: data.profile.agentProfile?.companyName || "",
            experienceYears: data.profile.agentProfile?.experienceYears || 0,
            bio: data.profile.agentProfile?.bio || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);
    setSubmitLoading(true);

    // Validate phone if entered
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      setSubmitError("Please enter a valid 10-digit Indian phone number.");
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to update profile");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) return null;

  const isAgent = profile.role === "AGENT";

  return (
    <div className="space-y-6 text-left max-w-2xl">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">My Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Update your account details and professional info.</p>
      </div>

      {submitSuccess && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs">
          <CheckCircle2 className="w-4.5 h-4.5 text-green-600 shrink-0" />
          <span>Your profile configurations were successfully saved.</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs">
          <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs font-semibold text-slate-600">
        
        {/* Primary Account Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-sm font-semibold text-primary border-b border-line pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-accent" /> Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Email Address (Read-only)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-slate-50 text-slate-400"
                />
                <ShieldCheck className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Indian Mobile Number</label>
              <input
                type="text"
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                placeholder="e.g. 9876543210"
                className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
                className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal"
              />
            </div>
          </div>
        </div>

        {/* Agent Profile specifics */}
        {isAgent && (
          <div className="space-y-4 pt-4 border-t border-line/60">
            <h3 className="font-serif text-sm font-semibold text-primary border-b border-line pb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" /> Professional Agent Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">Company / Brokerage Name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g. Prestige Realty Group"
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) => setForm(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 mb-1">Professional Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe your expertise, local markets, and services..."
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 leading-normal"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitLoading}
          className="bg-primary hover:bg-slate-800 text-secondary py-2.5 px-6 rounded-full font-bold transition cursor-pointer disabled:opacity-50"
        >
          {submitLoading ? "Saving changes..." : "Save Changes"}
        </button>

      </form>
    </div>
  );
}
