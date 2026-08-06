"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { Building, MapPin, BookOpen, Award, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import SearchableCountrySelect from "@/components/ui/SearchableCountrySelect";

export default function AddCollegePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collegeType: "PRIVATE",
    countryId: "",
    cityName: "",
    address: "",
    website: "",
    email: "",
    phone: "",
    establishedYear: "",
    totalStudents: "",
    campusArea: "",
    gender: "CO_ED",
    affiliation: "",
    nirfRanking: "",
    qsRanking: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      setCountries(d.countries || []);
      if (d.countries?.length > 0) {
        setFormData(prev => ({ ...prev, countryId: d.countries[0].id }));
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/colleges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : null,
          totalStudents: formData.totalStudents ? parseInt(formData.totalStudents) : null,
          nirfRanking: formData.nirfRanking ? parseInt(formData.nirfRanking) : null,
          qsRanking: formData.qsRanking ? parseInt(formData.qsRanking) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/colleges/${data.college.id}`);
      } else {
        alert("Failed to submit college listing.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-12">
        <div className="bg-white border border-line rounded-3xl p-6 md:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
              Step {step} of 3
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mt-2">
              {step === 1 && "Basic College Information"}
              {step === 2 && "Location & Contact Details"}
              {step === 3 && "Rankings, Media & Review"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              List your institution on Ink EduVerse to reach millions of prospective students worldwide.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">College Name *</label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Imperial College London / IIT Bombay"
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">College Type</label>
                    <select
                      value={formData.collegeType}
                      onChange={e => setFormData({ ...formData, collegeType: e.target.value })}
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-accent"
                    >
                      <option value="GOVERNMENT">Government</option>
                      <option value="PRIVATE">Private</option>
                      <option value="DEEMED">Deemed</option>
                      <option value="AUTONOMOUS">Autonomous</option>
                      <option value="CENTRAL">Central</option>
                      <option value="INTERNATIONAL">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Gender Admission</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-accent"
                    >
                      <option value="CO_ED">Co-Educational</option>
                      <option value="BOYS_ONLY">Boys Only</option>
                      <option value="GIRLS_ONLY">Girls Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description *</label>
                  <textarea
                    rows={4} required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a detailed overview of the college, campus, history, and achievements..."
                    className="w-full border border-line rounded-xl p-4 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Established Year</label>
                    <input
                      type="number"
                      value={formData.establishedYear}
                      onChange={e => setFormData({ ...formData, establishedYear: e.target.value })}
                      placeholder="e.g. 1961"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Students</label>
                    <input
                      type="number"
                      value={formData.totalStudents}
                      onChange={e => setFormData({ ...formData, totalStudents: e.target.value })}
                      placeholder="e.g. 12000"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Campus Area</label>
                    <input
                      type="text"
                      value={formData.campusArea}
                      onChange={e => setFormData({ ...formData, campusArea: e.target.value })}
                      placeholder="e.g. 500 Acres"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Location & Contact */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Country *</label>
                  <SearchableCountrySelect
                    countries={countries.map(c => ({ code: c.id, name: `${c.flag || "🌍"} ${c.name}` }))}
                    value={formData.countryId}
                    onChange={selectedId => setFormData({ ...formData, countryId: selectedId })}
                    placeholder="Select Country"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">City Name *</label>
                  <input
                    type="text" required
                    value={formData.cityName}
                    onChange={e => setFormData({ ...formData, cityName: e.target.value })}
                    placeholder="e.g. London / Mumbai / Boston"
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Campus Address *</label>
                  <input
                    type="text" required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. South Kensington Campus, London SW7 2AZ"
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Official Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Admissions Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admissions@college.edu"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Rankings & Review */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">NIRF Ranking (if applicable)</label>
                    <input
                      type="number"
                      value={formData.nirfRanking}
                      onChange={e => setFormData({ ...formData, nirfRanking: e.target.value })}
                      placeholder="e.g. 1"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">QS World Ranking</label>
                    <input
                      type="number"
                      value={formData.qsRanking}
                      onChange={e => setFormData({ ...formData, qsRanking: e.target.value })}
                      placeholder="e.g. 6"
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Or leave blank to use a default campus image.</p>
                </div>

                {/* Summary Box */}
                <div className="bg-paper border border-line rounded-2xl p-5 space-y-2 text-xs text-slate-600">
                  <p className="font-bold text-primary text-sm">Listing Review Summary</p>
                  <p><strong>Name:</strong> {formData.name || "N/A"}</p>
                  <p><strong>City:</strong> {formData.cityName || "N/A"}</p>
                  <p><strong>Type:</strong> {formData.collegeType}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-line pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-line rounded-xl text-xs font-bold text-slate-600 hover:bg-paper transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous Step
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !formData.name) return alert("Please enter college name.");
                    if (step === 2 && !formData.cityName) return alert("Please enter city name.");
                    setStep(step + 1);
                  }}
                  className="bg-primary text-secondary px-8 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent hover:bg-accent-hover text-primary px-8 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit College Listing"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
