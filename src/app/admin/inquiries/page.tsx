"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Phone, CalendarRange, CheckCircle2, Clock, Filter, AlertCircle, RefreshCw, UserCheck, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    transactionType: string;
    price: number;
    city: { name: string };
    locality: { name: string };
  };
  sender: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface VisitItem {
  id: string;
  date: string;
  timeSlot: string;
  type: string;
  status: string;
  message?: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    transactionType: string;
    city: { name: string };
    locality: { name: string };
  };
  visitor: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface AdminAlertItem {
  id: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CALLBACK" | "ENQUIRY" | "TOUR" | "SEEKER" | "FEEDBACK">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [adminAlerts, setAdminAlerts] = useState<AdminAlertItem[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [alertStatuses, setAlertStatuses] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("admin_seeker_requirement_statuses") || "{}");
      } catch {
        return {};
      }
    }
    return {};
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
        setVisits(data.visits || []);
        setAdminAlerts(data.adminAlerts || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "enquiry", id, status: newStatus }),
      });
      if (res.ok) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateVisitStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "visit", id, status: newStatus }),
      });
      if (res.ok) {
        setVisits(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAlertStatus = async (id: string, newStatus: "CONTACTED" | "FULFILLED" | "RESOLVED") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "alert", id, status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === "RESOLVED") {
          setAdminAlerts(prev => prev.filter(a => a.id !== id));
        } else {
          setAlertStatuses(prev => {
            const updated = { ...prev, [id]: newStatus as any };
            if (typeof window !== "undefined") {
              localStorage.setItem("admin_seeker_requirement_statuses", JSON.stringify(updated));
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const extractContact = (text: string) => {
    const phoneMatch = text.match(/\b\d{10}\b/);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const nameMatch = text.match(/(?:from|Contact from|Inquiry from)\s+([A-Za-z\s]+?)(?=\s*\(|\s*:|$)/i);
    return {
      phone: phoneMatch ? phoneMatch[0] : null,
      email: emailMatch ? emailMatch[0] : null,
      name: nameMatch ? nameMatch[1].trim() : "Custom Seeker",
    };
  };

  const parseSeekerRequirement = (text: string) => {
    const cityMatch = text.match(/City:\s*([^\n\r]+)/i);
    const typeMatch = text.match(/Type:\s*([^\n\r]+)/i);
    const purposeMatch = text.match(/Purpose:\s*([^\n\r]+)/i);

    const city = cityMatch ? cityMatch[1].trim() : "";
    const typeStr = typeMatch ? typeMatch[1].trim() : "";
    const purposeStr = purposeMatch ? purposeMatch[1].trim() : "";

    let transactionType = "";
    if (purposeStr.toLowerCase().includes("rent")) transactionType = "RENT";
    else if (purposeStr.toLowerCase().includes("buy") || purposeStr.toLowerCase().includes("sale")) transactionType = "SALE";
    else if (purposeStr.toLowerCase().includes("lease")) transactionType = "LEASE";

    const searchParams = new URLSearchParams();
    if (city) {
      searchParams.set("city", city);
      searchParams.set("citySearch", city);
    }
    if (transactionType) {
      searchParams.set("type", transactionType);
      searchParams.set("transactionType", transactionType);
    }

    const searchPath = `/properties?${searchParams.toString()}`;
    return { city, typeStr, purposeStr, searchPath };
  };

  // Categorize items
  const callbackEnquiries = enquiries.filter(e => e.message.includes("Callback Request"));
  const generalEnquiries = enquiries.filter(e => !e.message.includes("Callback Request"));

  const seekerAlerts = adminAlerts.filter(a => a.message.includes("Purpose:") || a.message.includes("Type:") || a.message.includes("Budget:"));
  const feedbackAlerts = adminAlerts.filter(a => !a.message.includes("Purpose:") && !a.message.includes("Type:") && !a.message.includes("Budget:"));

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div className="space-y-6 text-left relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
            <Phone className="w-6 h-6 text-accent" /> Inquiries & Customer Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All user enquiries, callback requests, visit bookings, seeker custom requirements, and customer feedback.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto text-xs font-semibold text-primary bg-white border border-line px-3.5 py-2 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 border border-line rounded-2xl shadow-xs">
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          {[
            { id: "ALL", label: `All Requests (${enquiries.length + visits.length + adminAlerts.length})` },
            { id: "CALLBACK", label: `Callbacks (${callbackEnquiries.length})` },
            { id: "ENQUIRY", label: `Enquiries (${generalEnquiries.length})` },
            { id: "TOUR", label: `Tour Visits (${visits.length})` },
            { id: "SEEKER", label: `Custom Requirements (${seekerAlerts.length})` },
            { id: "FEEDBACK", label: `User Feedback (${feedbackAlerts.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-primary text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, listing..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line bg-secondary text-xs outline-none focus:border-accent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 justify-center flex-1">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-mono">Loading inquiries & requests...</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* 1. CALLBACK REQUESTS */}
          {(activeFilter === "ALL" || activeFilter === "CALLBACK") && callbackEnquiries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-accent" /> Callback Requests ({callbackEnquiries.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {callbackEnquiries
                  .filter(item => matchesSearch(`${item.name} ${item.phone} ${item.property?.title}`))
                  .map(item => (
                    <div key={item.id} className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Callback Request
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-primary text-sm">{item.name}</p>
                        <p className="font-mono text-slate-700 font-semibold text-sm flex items-center gap-1">
                          📞 <a href={`tel:${item.phone}`} className="hover:underline text-accent">{item.phone}</a>
                        </p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{item.message}</p>
                      </div>

                      {item.property && (
                        <div className="bg-secondary p-2.5 rounded-xl border border-line text-[11px] flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-primary truncate max-w-[200px]">{item.property.title}</p>
                            <p className="text-slate-400 text-[10px]">{item.property.locality?.name}, {item.property.city?.name}</p>
                          </div>
                          <Link href={`/properties/${item.property.id}`} target="_blank" className="text-accent text-[10px] font-bold hover:underline">
                            View Listing ↗
                          </Link>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === "CONTACTED" ? "bg-green-100 text-green-700" : item.status === "RESOLVED" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"
                        }`}>
                          Status: {item.status}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.status !== "CONTACTED" && (
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateEnquiryStatus(item.id, "CONTACTED")}
                              className="text-[11px] bg-accent text-primary font-bold px-3 py-1 rounded-lg hover:bg-accent/90 cursor-pointer disabled:opacity-50"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {item.status !== "RESOLVED" && (
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateEnquiryStatus(item.id, "RESOLVED")}
                              className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 2. GENERAL ENQUIRIES */}
          {(activeFilter === "ALL" || activeFilter === "ENQUIRY") && generalEnquiries.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-accent" /> Property Enquiries ({generalEnquiries.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalEnquiries
                  .filter(item => matchesSearch(`${item.name} ${item.phone} ${item.email} ${item.property?.title}`))
                  .map(item => (
                    <div key={item.id} className="bg-white border border-line rounded-2xl p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Property Enquiry
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-primary text-sm">{item.name}</p>
                        <p className="text-slate-600">✉️ {item.email} | 📞 <a href={`tel:${item.phone}`} className="hover:underline text-accent font-semibold">{item.phone}</a></p>
                        <p className="bg-slate-50 p-2 rounded-lg border border-line/60 text-slate-700 text-[11px] leading-relaxed italic">"{item.message}"</p>
                      </div>

                      {item.property && (
                        <div className="bg-secondary p-2.5 rounded-xl border border-line text-[11px] flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-primary truncate max-w-[200px]">{item.property.title}</p>
                            <p className="text-slate-400 text-[10px]">{item.property.locality?.name}, {item.property.city?.name}</p>
                          </div>
                          <Link href={`/properties/${item.property.id}`} target="_blank" className="text-accent text-[10px] font-bold hover:underline">
                            View Listing ↗
                          </Link>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === "CONTACTED" ? "bg-green-100 text-green-700" : item.status === "RESOLVED" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                        }`}>
                          Status: {item.status}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.status !== "CONTACTED" && (
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateEnquiryStatus(item.id, "CONTACTED")}
                              className="text-[11px] bg-accent text-primary font-bold px-3 py-1 rounded-lg hover:bg-accent/90 cursor-pointer disabled:opacity-50"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {item.status !== "RESOLVED" && (
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateEnquiryStatus(item.id, "RESOLVED")}
                              className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. TOUR VISITS */}
          {(activeFilter === "ALL" || activeFilter === "TOUR") && visits.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-accent" /> Property Tour Visits ({visits.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visits
                  .filter(item => matchesSearch(`${item.visitor?.name} ${item.visitor?.phone} ${item.property?.title}`))
                  .map(item => (
                    <div key={item.id} className="bg-white border border-line rounded-2xl p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
                        <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CalendarRange className="w-3 h-3" /> Tour Request ({item.type === "IN_PERSON" ? "In-Person" : "Video Tour"})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Requested: {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-primary text-sm">{item.visitor?.name}</p>
                        <p className="text-slate-600">📞 <a href={`tel:${item.visitor?.phone}`} className="hover:underline text-accent font-semibold">{item.visitor?.phone}</a> | ✉️ {item.visitor?.email}</p>
                        <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 text-purple-900 font-medium">
                          📅 Scheduled Date: <span className="font-bold">{new Date(item.date).toLocaleDateString("en-IN")}</span> ({item.timeSlot})
                        </div>
                        {item.message && <p className="text-slate-500 italic text-[11px]">"{item.message}"</p>}
                      </div>

                      {item.property && (
                        <div className="bg-secondary p-2.5 rounded-xl border border-line text-[11px] flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-primary truncate max-w-[200px]">{item.property.title}</p>
                            <p className="text-slate-400 text-[10px]">{item.property.locality?.name}, {item.property.city?.name}</p>
                          </div>
                          <Link href={`/properties/${item.property.id}`} target="_blank" className="text-accent text-[10px] font-bold hover:underline">
                            View Listing ↗
                          </Link>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === "CONFIRMED" ? "bg-green-100 text-green-700" : item.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          Status: {item.status}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.status !== "CONFIRMED" && (
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateVisitStatus(item.id, "CONFIRMED")}
                              className="text-[11px] bg-accent text-primary font-bold px-3 py-1 rounded-lg hover:bg-accent/90 cursor-pointer disabled:opacity-50"
                            >
                              Approve Tour
                            </button>
                          )}
                          {item.status !== "COMPLETED" && (
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateVisitStatus(item.id, "COMPLETED")}
                              className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 4. CUSTOM SEEKER REQUIREMENTS */}
          {(activeFilter === "ALL" || activeFilter === "SEEKER") && seekerAlerts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-accent" /> Custom Seeker Requirements ({seekerAlerts.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seekerAlerts
                  .filter(item => matchesSearch(item.message))
                  .map(item => {
                    const contact = extractContact(item.message);
                    const parsedReq = parseSeekerRequirement(item.message);
                    const currentStatus = alertStatuses[item.id] || (item.isRead ? "CONTACTED" : "PENDING");

                    const fullMatchUrl = typeof window !== "undefined" 
                      ? `${window.location.origin}${parsedReq.searchPath}`
                      : parsedReq.searchPath;

                    const whatsappMessage = `Hi ${contact.name}, we found matching properties on RE Onestoppage for your requirement (${parsedReq.typeStr || 'Property'} for ${parsedReq.purposeStr || 'Rent/Sale'} ${parsedReq.city ? 'in ' + parsedReq.city : ''}):\n${fullMatchUrl}`;

                    return (
                      <div key={item.id} className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-700" /> Custom Seeker Requirement
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>

                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-line/60 leading-relaxed max-h-48 overflow-y-auto">
                            {item.message}
                          </pre>

                          {/* 1-Click Automated Property Matching Box */}
                          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                                ⚡ Automated Property Match
                              </span>
                              <Link
                                href={parsedReq.searchPath}
                                target="_blank"
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-lg transition shadow-xs flex items-center gap-1"
                              >
                                🔍 Find Matches ↗
                              </Link>
                            </div>
                            <p className="text-[10px] text-amber-800/80">
                              Instant filter search for {parsedReq.purposeStr || 'Requirements'} {parsedReq.city ? `in ${parsedReq.city}` : ''}
                            </p>
                          </div>

                          {/* Quick Contact Action Bar */}
                          {contact.phone && (
                            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                              <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                                👤 {contact.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md hover:bg-emerald-700 transition flex items-center gap-1"
                                >
                                  📞 Call
                                </a>
                                <a
                                  href={`https://wa.me/91${contact.phone}?text=${encodeURIComponent(whatsappMessage)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md hover:bg-green-600 transition flex items-center gap-1"
                                >
                                  💬 Share Matches on WhatsApp
                                </a>
                                {contact.email && (
                                  <a
                                    href={`mailto:${contact.email}?subject=${encodeURIComponent("Property Matches for your requirement")}&body=${encodeURIComponent(whatsappMessage)}`}
                                    className="bg-slate-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md hover:bg-slate-800 transition"
                                  >
                                    ✉️ Email
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status & Fulfillment Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-line/60 mt-2 flex-wrap gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            currentStatus === "FULFILLED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : currentStatus === "CONTACTED"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            Status: {currentStatus}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {currentStatus !== "CONTACTED" && currentStatus !== "FULFILLED" && (
                              <button
                                disabled={actionLoading === item.id}
                                onClick={() => handleUpdateAlertStatus(item.id, "CONTACTED")}
                                className="text-[10px] bg-accent text-primary font-bold px-2.5 py-1 rounded-lg hover:bg-accent/90 cursor-pointer disabled:opacity-50"
                              >
                                Mark Contacted
                              </button>
                            )}
                            {currentStatus !== "FULFILLED" && (
                              <button
                                disabled={actionLoading === item.id}
                                onClick={() => handleUpdateAlertStatus(item.id, "FULFILLED")}
                                className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-700 cursor-pointer disabled:opacity-50 shadow-xs"
                              >
                                ✓ Fulfill Requirement
                              </button>
                            )}
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateAlertStatus(item.id, "RESOLVED")}
                              className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 5. USER FEEDBACK & SUGGESTIONS */}
          {(activeFilter === "ALL" || activeFilter === "FEEDBACK") && feedbackAlerts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-accent" /> User Feedback &amp; Suggestions ({feedbackAlerts.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackAlerts
                  .filter(item => matchesSearch(item.message))
                  .map(item => {
                    const contact = extractContact(item.message);
                    const currentStatus = alertStatuses[item.id] || (item.isRead ? "REVIEWED" : "NEW");

                    const feedbackWhatsappMsg = `Hi ${contact.name}, thank you for your feedback on RE Onestoppage! We have reviewed your suggestions and would love to help you with your requirements.`;

                    return (
                      <div key={item.id} className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              💬 User Feedback / Contact Message
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>

                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed max-h-48 overflow-y-auto italic">
                            {item.message}
                          </pre>

                          {/* Quick Contact & Response Bar */}
                          {contact.phone && (
                            <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                              <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                                👤 {contact.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                                >
                                  📞 Call
                                </a>
                                <a
                                  href={`https://wa.me/91${contact.phone}?text=${encodeURIComponent(feedbackWhatsappMsg)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md hover:bg-green-600 transition flex items-center gap-1"
                                >
                                  💬 Reply via WhatsApp
                                </a>
                                {contact.email && (
                                  <a
                                    href={`mailto:${contact.email}?subject=${encodeURIComponent("Re: Your Feedback on RE Onestoppage")}&body=${encodeURIComponent(feedbackWhatsappMsg)}`}
                                    className="bg-slate-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md hover:bg-slate-800 transition"
                                  >
                                    ✉️ Email
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-line/60 mt-2 flex-wrap gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            currentStatus === "ADDRESSED" || currentStatus === "FULFILLED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : currentStatus === "REVIEWED" || currentStatus === "CONTACTED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            Status: {currentStatus}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {currentStatus !== "REVIEWED" && currentStatus !== "ADDRESSED" && (
                              <button
                                disabled={actionLoading === item.id}
                                onClick={() => handleUpdateAlertStatus(item.id, "CONTACTED")}
                                className="text-[10px] bg-accent text-primary font-bold px-2.5 py-1 rounded-lg hover:bg-accent/90 cursor-pointer disabled:opacity-50"
                              >
                                Mark Reviewed
                              </button>
                            )}
                            {currentStatus !== "ADDRESSED" && (
                              <button
                                disabled={actionLoading === item.id}
                                onClick={() => handleUpdateAlertStatus(item.id, "FULFILLED")}
                                className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 shadow-xs"
                              >
                                ✓ Address Feedback
                              </button>
                            )}
                            <button
                              disabled={actionLoading === item.id}
                              onClick={() => handleUpdateAlertStatus(item.id, "RESOLVED")}
                              className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {enquiries.length === 0 && visits.length === 0 && adminAlerts.length === 0 && (
            <div className="bg-white border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-serif text-base text-primary font-semibold">No Pending Requests</h3>
              <p className="text-xs text-slate-500 mt-1">All customer enquiries, tour bookings, and callback requests are up to date.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
