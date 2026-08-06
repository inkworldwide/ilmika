"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "NEW" | "CONTACTED" | "INTERESTED" | "VISIT_SCHEDULED" | "CLOSED" | "SPAM";
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
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DashboardEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("USER");

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, enqRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/dashboard/enquiries"),
        ]);

        const meData = await meRes.json();
        const enqData = await enqRes.json();

        if (meData.user) setRole(meData.user.role);
        if (enqData.enquiries) setEnquiries(enqData.enquiries);
      } catch (err) {
        console.error(err);
      } fontFinally: {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = async (enquiryId: string, status: string) => {
    try {
      const res = await fetch(`/api/dashboard/enquiries?id=${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setEnquiries(prev =>
        prev.map(e => (e.id === enquiryId ? { ...e, status: data.enquiry.status } : e))
      );
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading enquiries &amp; applications...</p>
      </div>
    );
  }

  const isOwner = role !== "USER";

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">
          {isOwner ? "Student Enquiries & Admissions Desk" : "My College Inquiries"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isOwner 
            ? "Review and manage student admission enquiries and applications received for your institution." 
            : "Review your submitted admission inquiries and institution responses."}
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Mail className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">No enquiries found</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            {isOwner 
              ? "When students submit inquiry forms on your college listings, their details will display here." 
              : "Explore universities and submit an inquiry to connect directly with admissions officers."}
          </p>
          <Link
            href="/colleges"
            className="inline-flex items-center gap-2 bg-primary text-secondary font-bold text-xs px-5 py-2.5 rounded-full hover:bg-slate-800 transition"
          >
            <span>Browse Colleges</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const dateStr = new Date(enq.createdAt).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric"
            });
            const statusColors: Record<string, string> = {
              NEW: "bg-red-50 text-red-700 border-red-200",
              CONTACTED: "bg-amber-50 text-amber-700 border-amber-200",
              INTERESTED: "bg-blue-50 text-blue-700 border-blue-200",
              VISIT_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
              CLOSED: "bg-green-50 text-green-700 border-green-200",
              SPAM: "bg-slate-50 text-slate-500 border-slate-200",
            };

            const title = enq.college?.name || enq.property?.title || "College Admission Enquiry";

            return (
              <div key={enq.id} className="bg-white border border-line rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-primary">{title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Submitted on {dateStr}</p>
                  </div>
                  
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${statusColors[enq.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {(enq.status || "NEW").replace("_", " ")}
                    </span>
                    
                    {/* Owner status selector */}
                    {isOwner && (
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className="border border-line rounded px-2 py-1 text-[11px] font-semibold bg-secondary text-slate-700"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="VISIT_SCHEDULED">Session Scheduled</option>
                        <option value="CLOSED">Closed</option>
                        <option value="SPAM">Spam</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Sender contact details (for admin/owner) */}
                  {isOwner && (
                    <div className="bg-secondary p-3 rounded-lg border border-line text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Student Name</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{enq.student?.name || enq.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Phone Number</p>
                        <a href={`tel:${enq.phone}`} className="font-semibold text-accent hover:underline flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5" /> {enq.phone || "N/A"}
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Email Address</p>
                        <a href={`mailto:${enq.email}`} className="font-semibold text-slate-700 hover:underline mt-0.5">{enq.email}</a>
                      </div>
                    </div>
                  )}

                  {/* Enquiry message */}
                  <div className="text-xs text-slate-600 bg-secondary/30 p-3.5 rounded-lg border border-line/40 leading-relaxed">
                    <p className="font-mono text-[10px] text-slate-400 uppercase font-bold mb-1">Inquiry Message</p>
                    <p className="italic">"{enq.message}"</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
