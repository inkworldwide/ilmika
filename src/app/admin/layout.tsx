"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Database,
  GraduationCap,
  AlertTriangle,
  Users,
  BarChart3,
  LayoutDashboard,
  Mail,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user.role !== "ADMIN") {
            router.push("/dashboard");
          }
        } else {
          router.push("/auth/login?callbackUrl=" + pathname);
        }
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    verifyAdmin();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-lg text-slate-200">Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Verification Queue", path: "/admin", icon: ShieldCheck },
    { name: "Enquiries & Applications", path: "/admin/inquiries", icon: Mail },
    { name: "User Directory", path: "/admin/users", icon: Users },
    { name: "Listed Colleges", path: "/admin/properties", icon: GraduationCap },
    { name: "Platform Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Database Manager", path: "/admin/database", icon: Database },
    { name: "College Reports", path: "/admin/reports", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 gap-6 items-stretch">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-[270px] bg-primary text-slate-200 border border-slate-800 rounded-3xl p-5 shadow-xl shrink-0 flex flex-col justify-between min-h-[580px]">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-5 px-1 pb-4 border-b border-slate-800">
              <div className="w-9.5 h-9.5 rounded-2xl bg-accent/20 border border-accent/40 grid place-items-center text-accent shadow-xs shrink-0">
                <ShieldAlert className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                  Admin Portal
                </h3>
                <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-accent" /> Ilmika Ops
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 mb-5">
              {menuItems.map((item) => {
                const isCurrent = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 text-xs font-semibold group ${
                      isCurrent 
                        ? "bg-accent text-primary font-bold shadow-lg shadow-accent/20 scale-[1.02]" 
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-slate-400 group-hover:text-accent"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isCurrent && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Return Button */}
          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-3 w-full rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-200 text-xs font-bold border border-slate-700/60"
            >
              <LayoutDashboard className="w-4 h-4 text-accent" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
          {children}
        </main>

      </div>
    </div>
  );
}
