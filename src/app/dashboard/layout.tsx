"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, User, Heart, Clock, Mail, CalendarRange, 
  MessageSquare, Bell, Building2, BarChart3, ChevronRight, Menu, ShieldAlert 
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
          <p className="font-serif text-lg text-primary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Sidebar link items
  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["USER", "OWNER", "AGENT", "ADMIN"] },
    { name: "My Profile", path: "/dashboard/profile", icon: User, roles: ["USER", "OWNER", "AGENT", "ADMIN"] },
    { name: "Saved Listings", path: "/dashboard/saved", icon: Heart, roles: ["USER"] },
    { name: "Recently Viewed", path: "/dashboard/recently-viewed", icon: Clock, roles: ["USER"] },
    
    // Owner / Agent Specific
    { name: "My Properties", path: "/dashboard/properties", icon: Building2, roles: ["OWNER", "AGENT", "ADMIN"] },
    { name: "Leads Analytics", path: "/dashboard/analytics", icon: BarChart3, roles: ["OWNER", "AGENT", "ADMIN"] },
    
    // Joint items with roles context
    { name: "Enquiries", path: "/dashboard/enquiries", icon: Mail, roles: ["USER", "OWNER", "AGENT", "ADMIN"] },
    { name: "Tours & Visits", path: "/dashboard/visits", icon: CalendarRange, roles: ["USER", "OWNER", "AGENT", "ADMIN"] },
    { name: "Inbox Messages", path: "/dashboard/messages", icon: MessageSquare, roles: ["USER", "OWNER", "AGENT", "ADMIN"] },
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell, roles: ["USER", "OWNER", "AGENT", "ADMIN"] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 gap-6">
        
        {/* Mobile menu toggle bar */}
        <div className="md:hidden flex items-center justify-between bg-white border border-line p-4 rounded-xl shadow-xs">
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
        <aside className={`w-full md:w-64 bg-primary border border-slate-800 rounded-2xl p-4 shadow-sm md:flex flex-col shrink-0 ${sidebarOpen ? "flex" : "hidden"}`}>
          <div className="px-3 py-2 border-b border-slate-800 mb-4 text-left">
            <h3 className="font-semibold text-white leading-snug">{user.name}</h3>
            <p className="text-[10px] font-mono text-slate-400 capitalize">{user.role.toLowerCase()} panel</p>
          </div>

          <nav className="space-y-1 flex-1">
            {filteredMenuItems.map((item) => {
              const isCurrent = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition font-medium text-sm ${
                    isCurrent 
                      ? "bg-accent text-primary font-bold shadow-md" 
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${isCurrent ? "text-primary" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? "text-primary" : "text-slate-500"}`} />
                </Link>
              );
            })}
          </nav>

          {user.role === "ADMIN" && (
            <div className="pt-4 mt-6 border-t border-slate-800">
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-accent text-primary hover:bg-yellow-500 transition font-bold text-sm shadow-md"
              >
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>Admin Portal</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 min-w-0 bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          {children}
        </div>

      </div>
    </div>
  );
}
