"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, User, Heart, Clock, Mail, CalendarRange, 
  MessageSquare, Bell, GraduationCap, ChevronRight, Menu, ShieldAlert
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch session on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/auth/login?callbackUrl=" + pathname);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-lg text-primary">Loading your ILMIKA dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Sidebar link items for ILMIKA
  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["USER", "COLLEGE_ADMIN", "AGENT", "ADMIN"] },
    { name: "My Profile", path: "/dashboard/profile", icon: User, roles: ["USER", "COLLEGE_ADMIN", "AGENT", "ADMIN"] },
    { name: "My Shortlist", path: "/dashboard/saved", icon: Heart, roles: ["USER"] },
    
    // College Admin Specific
    { name: "My Colleges", path: "/colleges/add", icon: GraduationCap, roles: ["COLLEGE_ADMIN", "AGENT", "ADMIN"] },
    
    // Joint items
    { name: "Applications & Enquiries", path: "/dashboard/enquiries", icon: Mail, roles: ["USER", "COLLEGE_ADMIN", "AGENT", "ADMIN"] },
    { name: "Counselling Sessions", path: "/dashboard/visits", icon: CalendarRange, roles: ["USER", "COLLEGE_ADMIN", "AGENT", "ADMIN"] },
    { name: "Inbox Messages", path: "/dashboard/messages", icon: MessageSquare, roles: ["USER", "COLLEGE_ADMIN", "AGENT", "ADMIN"] },
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell, roles: ["USER", "COLLEGE_ADMIN", "AGENT", "ADMIN"] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-6 items-stretch">
        
        {/* Mobile menu toggle bar */}
        <div className="md:hidden flex items-center justify-between bg-white border border-line p-4 rounded-xl shadow-xs w-full">
          <span className="font-serif text-md font-semibold text-primary">Dashboard Menu</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            className="w-9 h-9 border border-line rounded-lg grid place-items-center cursor-pointer hover:bg-secondary text-primary"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-64 bg-[#0B132B] text-slate-200 border border-slate-800 rounded-2xl p-5 shadow-xl md:flex flex-col justify-between shrink-0 self-stretch ${sidebarOpen ? "flex" : "hidden"}`}>
          <div className="px-2 py-1 border-b border-slate-800 pb-4 mb-4 text-left">
            <h3 className="font-serif font-bold text-white text-base leading-snug">{user.name}</h3>
            <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest mt-0.5">
              {user.role === "USER" ? "Student Portal" : user.role === "COLLEGE_ADMIN" ? "College Admin Desk" : user.role === "AGENT" ? "Advisor Desk" : "System Admin"}
            </p>
          </div>

          <nav className="space-y-1.5 flex-1">
            {filteredMenuItems.map((item) => {
              const isCurrent = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 text-xs font-semibold group ${
                    isCurrent 
                      ? "bg-accent text-primary font-bold shadow-md shadow-accent/20" 
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-slate-400 group-hover:text-accent"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? "text-primary" : "text-slate-500 group-hover:text-white"}`} />
                </Link>
              );
            })}
          </nav>

          {user.role === "ADMIN" && (
            <div className="pt-4 mt-6 border-t border-slate-800">
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-accent text-primary hover:bg-yellow-500 transition font-bold text-xs shadow-md"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 min-w-0 w-full bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          {children}
        </div>

      </div>
    </div>
  );
}
