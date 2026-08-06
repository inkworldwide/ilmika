"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarRange, Check, X, Clock, Video, 
  MapPin, HelpCircle, AlertCircle, RefreshCw 
} from "lucide-react";

interface Visit {
  id: string;
  propertyId: string;
  date: string;
  timeSlot: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  type: "IN_PERSON" | "VIDEO_TOUR";
  message: string | null;
  createdAt: string;
  college?: {
    id: string;
    name: string;
    slug?: string;
  };
  property?: {
    id: string;
    title: string;
  };
  visitor?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function DashboardVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("USER");

  // Reschedule form modal state
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", timeSlot: "10:00 AM - 12:00 PM" });

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, visitsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/dashboard/visits"),
        ]);

        const meData = await meRes.json();
        const visitsData = await visitsRes.json();

        if (meData.user) setRole(meData.user.role);
        if (visitsData.visits) setVisits(visitsData.visits);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusUpdate = async (visitId: string, status: string, additionalData: any = {}) => {
    try {
      const res = await fetch(`/api/dashboard/visits?id=${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...additionalData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local state list
      setVisits(prev =>
        prev.map(v => (v.id === visitId ? { ...v, ...data.visit } : v))
      );
      
      setActiveRescheduleId(null);
    } catch (err: any) {
      alert(err.message || "Failed to update visit status");
    }
  };

  const startReschedule = (visit: Visit) => {
    setActiveRescheduleId(visit.id);
    const cleanDate = new Date(visit.date).toISOString().split("T")[0];
    setRescheduleForm({
      date: cleanDate,
      timeSlot: visit.timeSlot,
    });
  };

  const handleRescheduleSubmit = (e: React.FormEvent, visitId: string) => {
    e.preventDefault();
    handleStatusUpdate(visitId, "PENDING", rescheduleForm);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading tour schedule...</p>
      </div>
    );
  }

  const isOwner = role !== "USER";

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Tours &amp; Visits</h2>
        <p className="text-xs text-slate-500 mt-1">
          {isOwner 
            ? "Manage property tour requests received from prospective tenants/buyers." 
            : "Keep track of physical or video visits you have requested."}
        </p>
      </div>

      {visits.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <CalendarRange className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">No visits scheduled</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isOwner 
              ? "When users request property tours for your listings, they will appear here for verification." 
              : "Book a tour from the property details page to coordinate physical visits or online video walkthroughs."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => {
            const dateStr = new Date(visit.date).toLocaleDateString("en-IN", {
              weekday: "short", year: "numeric", month: "short", day: "numeric"
            });
            const statusColors = {
              PENDING: "bg-amber-50 text-amber-700 border-amber-200",
              CONFIRMED: "bg-green-50 text-green-700 border-green-200",
              COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
              CANCELLED: "bg-slate-50 text-slate-500 border-slate-200",
              REJECTED: "bg-red-50 text-red-700 border-red-200",
            };

            const isPending = visit.status === "PENDING";
            const isConfirmed = visit.status === "CONFIRMED";

            return (
              <div key={visit.id} className="bg-white border border-line rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-sm font-semibold text-primary">
                      {visit.college?.name || visit.property?.title || "Counselling Appointment"}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${statusColors[visit.status]}`}>
                      {visit.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {dateStr} ({visit.timeSlot})
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      {visit.type === "VIDEO_TOUR" ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-highlight" />
                          Video Call Tour
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          In-Person Visit
                        </>
                      )}
                    </span>
                  </div>

                  {/* Visitor details (for owner) */}
                  {isOwner && visit.visitor && (
                    <div className="bg-secondary p-3 rounded-lg border border-line text-xs space-y-1">
                      <p className="font-semibold text-slate-700">Visitor: {visit.visitor.name}</p>
                      <p className="text-slate-500">Phone: {visit.visitor.phone} | Email: {visit.visitor.email}</p>
                      {visit.message && <p className="text-slate-500 italic mt-1">"{visit.message}"</p>}
                    </div>
                  )}

                  {/* Owner message details (for visitor) */}
                  {!isOwner && visit.message && (
                    <p className="text-xs italic text-slate-500">Your message: "{visit.message}"</p>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="shrink-0 flex flex-col items-stretch sm:flex-row gap-2 w-full md:w-auto">
                  {/* Rescheduling Form Overlay inside item */}
                  {activeRescheduleId === visit.id ? (
                    <form onSubmit={(e) => handleRescheduleSubmit(e, visit.id)} className="border border-line bg-secondary p-3 rounded-xl space-y-3 text-xs w-full sm:w-60 text-left">
                      <div className="space-y-1">
                        <label className="block font-semibold">New Date</label>
                        <input
                          type="date"
                          required
                          value={rescheduleForm.date}
                          onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full border border-line rounded px-2 py-1 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-semibold">New Time Slot</label>
                        <select
                          value={rescheduleForm.timeSlot}
                          onChange={(e) => setRescheduleForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                          className="w-full border border-line rounded px-2 py-1 bg-white"
                        >
                          <option>10:00 AM - 12:00 PM</option>
                          <option>12:00 PM - 02:00 PM</option>
                          <option>02:00 PM - 04:00 PM</option>
                          <option>04:00 PM - 06:00 PM</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-primary text-secondary rounded font-bold hover:bg-slate-800 transition cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRescheduleId(null)}
                          className="flex-1 py-1.5 border border-line rounded hover:bg-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Owner controls: Approve / Decline / Reschedule */}
                      {isOwner && isPending && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(visit.id, "CONFIRMED")}
                            type="button"
                            className="bg-primary hover:bg-slate-800 text-secondary px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(visit.id, "REJECTED")}
                            type="button"
                            className="border border-line hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 text-slate-500"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                          <button
                            onClick={() => startReschedule(visit)}
                            type="button"
                            className="border border-line hover:bg-secondary px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 text-slate-500"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                          </button>
                        </>
                      )}

                      {/* Owner controls: Complete visit */}
                      {isOwner && isConfirmed && (
                        <button
                          onClick={() => handleStatusUpdate(visit.id, "COMPLETED")}
                          type="button"
                          className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}

                      {/* Visitor controls: Cancel visit */}
                      {!isOwner && (isPending || isConfirmed) && (
                        <button
                          onClick={() => handleStatusUpdate(visit.id, "CANCELLED")}
                          type="button"
                          className="border border-line hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer text-slate-500 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel Request
                        </button>
                      )}
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
