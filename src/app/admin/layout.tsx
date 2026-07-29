"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ShieldCheck, Database, LayoutGrid, LogOut, AlertTriangle, Users, BarChart3, LayoutDashboard } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-lg text-primary">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Verification Queue", path: "/admin", icon: ShieldCheck },
    { name: "User Directory", path: "/admin/users", icon: Users },
    { name: "Listed Properties", path: "/admin/properties", icon: LayoutGrid },
    { name: "Platform Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Database Manager", path: "/admin/database", icon: Database },
    { name: "Listing Reports", path: "/admin/reports", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row w-full mx-auto px-4 md:px-8 py-8 gap-6">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border border-line rounded-xl p-5 shadow-xs shrink-0 flex flex-col">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-line grid place-items-center">
              <ShieldAlert className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-primary text-sm tracking-tight">Admin Portal</h3>
              <p className="text-[10px] font-medium text-slate-500">System Operations</p>
            </div>
          </div>

          <nav className="space-y-0.5 mb-6 flex-1">
            {menuItems.map((item) => {
              const isCurrent = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isCurrent 
                      ? "bg-primary text-white font-medium shadow-sm" 
                      : "text-slate-600 font-normal hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? "text-accent" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-line mt-auto">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary transition-all duration-200 text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </aside>

        {/* Admin Content Container */}
        <main className="flex-1 min-w-0 bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-sm text-left">
          {children}
        </main>

      </div>
    </div>
  );
}
