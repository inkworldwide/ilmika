"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, Heart, CalendarRange, Bell, Plus, ArrowLeft } from "lucide-react";
import { Logo } from "../ui/Logo";
import NavMenu from "./NavMenu";
import MobileNavMenu from "./MobileNavMenu";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isEmailVerified: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mMenuOpen, setMMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check auth session on mount and pathname changes
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          const count = data.notifications.filter((n: any) => !n.isRead).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("Fetch unread count error:", err);
      }
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        setProfileDropdownOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-secondary/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Logo />

          {/* Desktop Nav links */}
          <NavMenu />

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-line animate-pulse"></div>
            ) : user ? (
              // Authenticated User Menu
              <div className="relative">
                <div className="flex items-center gap-3">
                  <Link 
                    href="/dashboard/notifications" 
                    className="w-9 h-9 rounded-full border border-line grid place-items-center hover:bg-paper transition relative text-primary/70 hover:text-primary"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1.5 bg-red-600 text-white text-[9px] font-bold rounded-full border border-secondary flex items-center justify-center font-mono">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    type="button"
                    className="flex items-center gap-2 cursor-pointer focus:outline-none"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover border border-accent"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-primary text-secondary flex items-center justify-center font-bold border border-line uppercase">
                        {user.name.charAt(0)}
                      </span>
                    )}
                    <span className="text-[14px] font-semibold text-primary/80 max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
                  </button>
                </div>

                {/* Profile Dropdown menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      {/* Click outside overlay */}
                      <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-white border border-line rounded-xl shadow-lg py-2 z-40 origin-top-right text-sm"
                      >
                        <div className="px-4 py-2 border-b border-line mb-1">
                          <p className="font-semibold text-primary truncate">{user.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                          {!user.isEmailVerified && (
                            <span className="inline-block mt-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Email Unverified
                            </span>
                          )}
                        </div>

                        <Link 
                          href="/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-secondary transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        
                        <Link 
                          href="/dashboard/saved" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-secondary transition"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          Saved Homes
                        </Link>

                        <Link 
                          href="/dashboard/visits" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-secondary transition"
                        >
                          <CalendarRange className="w-4 h-4 text-slate-400" />
                          My Visits
                        </Link>

                        {user.role !== "USER" && (
                          <Link 
                            href="/properties/add" 
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-accent hover:bg-secondary font-medium transition"
                          >
                            <Plus className="w-4 h-4 text-accent" />
                            List Property
                          </Link>
                        )}

                        <div className="w-full h-px bg-line my-1"></div>

                        <button
                          onClick={handleLogout}
                          type="button"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 text-left transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Unauthenticated actions
              <>
                <Link 
                  href="/auth/login" 
                  className="text-[14px] font-semibold text-primary/80 hover:text-primary px-3 py-2 transition"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth/register" 
                  className="text-[14px] font-bold bg-primary text-secondary px-5 py-2.5 rounded-full hover:bg-primary/95 transition shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMMenuOpen(!mMenuOpen)}
            type="button"
            className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-line cursor-pointer text-primary"
            aria-label="Toggle menu"
          >
            {mMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-line bg-secondary px-5 pb-6 overflow-hidden"
          >
            {/* Mobile Nav Links */}
            <MobileNavMenu closeMenu={() => setMMenuOpen(false)} />

            <div className="h-px bg-line my-3"></div>

            {user ? (
              <div className="flex flex-col gap-1.5 font-semibold text-[15px]">
                <Link href="/dashboard" onClick={() => setMMenuOpen(false)} className="py-2 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  My Dashboard ({user.name.split(" ")[0]})
                </Link>
                <button
                  onClick={() => { setMMenuOpen(false); handleLogout(); }}
                  type="button"
                  className="text-left py-2.5 text-red-600 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link 
                  href="/auth/login" 
                  onClick={() => setMMenuOpen(false)}
                  className="text-center py-2.5 border border-line rounded-xl font-bold hover:bg-paper transition"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={() => setMMenuOpen(false)}
                  className="text-center py-2.5 bg-primary text-secondary rounded-xl font-bold hover:bg-primary/95 transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditionally rendered Back to Home button below Navbar */}
      {pathname !== "/" && (
        <div className="bg-white border-b border-line px-5 md:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-accent transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
