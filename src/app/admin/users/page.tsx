"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Trash2, Mail, Phone, ShieldCheck, ShieldAlert, Search, Edit3, UserCheck, UserX, Lock, Key, Eye, EyeOff, Building, ExternalLink, Pencil, MapPin, X, Star } from "lucide-react";

interface User {
  id: string;
  customId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isSuspended: boolean;
  createdAt: string;
  plainPassword?: string;
  properties?: {
    city?: {
      name: string;
    };
  }[];
  agentProfile?: {
    id: string;
    companyName: string | null;
    ratingAverage: number;
    isFeatured?: boolean;
  } | null;
}

const getCityCode = (cityName?: string, userId?: string) => {
  if (cityName && cityName.trim().length >= 2) {
    const clean = cityName.trim().toUpperCase();
    if (clean.startsWith("BENGALURU") || clean.startsWith("BANGALORE")) return "BE";
    if (clean.startsWith("KOCHI") || clean.startsWith("COCHIN")) return "KO";
    if (clean.startsWith("MUMBAI") || clean.startsWith("BOMBAY")) return "MU";
    if (clean.startsWith("DELHI")) return "DE";
    if (clean.startsWith("HYDERABAD")) return "HY";
    if (clean.startsWith("CHENNAI")) return "CH";
    if (clean.startsWith("PUNE")) return "PU";
    if (clean.startsWith("KOLKATA")) return "KO";
    if (clean.startsWith("AHMEDABAD")) return "AH";
    if (clean.startsWith("GURUGRAM") || clean.startsWith("GURGAON")) return "GU";
    if (clean.startsWith("NOIDA")) return "NO";
    return clean.substring(0, 2);
  }
  const cityCodes = ["KO", "MU", "BE", "DE", "HY", "CH", "PU", "AH", "GU", "NO"];
  const charSum = (userId || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return cityCodes[charSum % cityCodes.length];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Modal States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // User Properties Modal State
  const [selectedUserForProps, setSelectedUserForProps] = useState<User | null>(null);
  const [userProps, setUserProps] = useState<any[]>([]);
  const [userPropsLoading, setUserPropsLoading] = useState(false);

  // Reset Password States
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  const handleOpenUserProperties = async (u: User) => {
    setSelectedUserForProps(u);
    setUserPropsLoading(true);
    try {
      const res = await fetch(`/api/admin/properties?ownerId=${u.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserProps([...(data.active || []), ...(data.archived || [])]);
      }
    } catch (err) {
      console.error("Failed to load user properties", err);
    } finally {
      setUserPropsLoading(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: string, role: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, role }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role } : u));
      } else {
        alert(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleApproval = async (targetUserId: string, currentApproval: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isApproved: !currentApproval }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { 
          ...u, 
          isApproved: !currentApproval,
          agentProfile: u.agentProfile || { id: "", companyName: null, ratingAverage: 0, isFeatured: true }
        } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle approval status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAgentFeatured = async (targetUserId: string, currentFeatured: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isAgentFeatured: !currentFeatured }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? {
          ...u,
          agentProfile: u.agentProfile ? { ...u.agentProfile, isFeatured: !currentFeatured } : { id: "", companyName: null, ratingAverage: 0, isFeatured: !currentFeatured }
        } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update agent featured status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspension = async (targetUserId: string, currentSuspension: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isSuspended: !currentSuspension }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isSuspended: !currentSuspension } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user suspension status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: editingUser.id,
          role: newRole,
          password: newPassword || undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u)
        );
        setEditingUser(null);
        setNewPassword("");
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword) return;
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: resettingUser.id,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        setResettingUser(null);
        setNewPassword("");
      } else {
        alert(data.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while resetting the password.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This will cascade delete all their property listings, messages, and enquiries!")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${targetUserId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== targetUserId));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const pendingUsers = filtered.filter(u => !u.isApproved && !u.isSuspended);
  const approvedUsers = filtered.filter(u => u.isApproved && !u.isSuspended);
  const suspendedUsers = filtered.filter(u => u.isSuspended);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading user directory...</p>
      </div>
    );
  }

  const renderUserRow = (u: User) => {
    const dateStr = new Date(u.createdAt).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });

    const cityName = u.properties?.[0]?.city?.name;
    const cityCode = getCityCode(cityName, u.id);
    const deterministicNum = parseInt(u.id.substring(0, 4), 16) % 9000 + 1000;
    
    let displayId = u.customId;
    if (!displayId || displayId.startsWith("RE")) {
      displayId = `${cityCode}${deterministicNum}`;
    }

    return (
      <tr key={u.id} className="hover:bg-secondary/15 transition">
        <td className="p-4">
          <span className="text-[11px] font-bold text-secondary bg-primary shadow-xs px-2.5 py-1 rounded border border-primary tracking-wider">{displayId}</span>
        </td>
        <td 
          className="p-4 cursor-pointer group hover:bg-slate-50/80 transition"
          onClick={() => handleOpenUserProperties(u)}
          title="Click to view listed properties"
        >
          <p className="font-semibold text-primary group-hover:text-accent transition flex items-center gap-1.5">
            {u.name.replace(/\s*\([^)]*\)/g, "").trim()}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-mono text-slate-400">Joined: {dateStr}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-accent group-hover:underline">
              <Building className="w-3 h-3" /> View Listings
            </span>
          </div>
        </td>
        <td className="p-4 space-y-1">
          <p className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
          </p>
          {u.phone && (
            <p className="flex items-center gap-1 font-mono text-[10px]">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}
            </p>
          )}
        </td>
        <td className="p-4 text-center space-y-1.5">
          <div className="flex justify-center">
            {u.isSuspended ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Suspended
              </span>
            ) : u.isApproved ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase animate-pulse">
                Pending
              </span>
            )}
          </div>
          <div>
            {u.isSuspended ? (
              <button
                onClick={() => handleToggleSuspension(u.id, true)}
                disabled={actionLoading}
                className="text-[10px] font-semibold text-emerald-600 underline hover:text-accent cursor-pointer font-bold"
              >
                Unsuspend Account
              </button>
            ) : (
              <button
                onClick={() => handleToggleApproval(u.id, u.isApproved)}
                disabled={actionLoading}
                className={`text-[10px] font-semibold underline hover:text-accent cursor-pointer ${
                  u.isApproved ? "text-slate-400" : "text-emerald-600 font-bold"
                }`}
              >
                {u.isApproved ? "Revoke Access" : "Approve Access"}
              </button>
            )}
          </div>
        </td>
        <td className="p-4">
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u.id, e.target.value)}
            disabled={actionLoading}
            className="border border-line rounded px-2 py-1 text-xs font-semibold bg-secondary text-slate-700 focus:outline-hidden focus:border-accent w-full"
          >
            <option value="USER">User (Seeker)</option>
            <option value="OWNER">Owner</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
        </td>
        <td className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-500 bg-secondary px-2 py-1 rounded border border-line min-w-[70px] inline-block text-center tracking-widest">
              {visiblePasswords[u.id] ? (u.plainPassword || `${u.role.toLowerCase()}123`) : "••••••••"}
            </span>
            <button 
              onClick={() => togglePasswordVisibility(u.id)}
              className="text-slate-400 hover:text-accent transition p-1 cursor-pointer"
              title="Toggle password visibility"
            >
              {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>
        <td className="p-4 text-right">
          <div className="flex justify-end gap-1.5">
            {(u.role === "AGENT" || u.role === "OWNER") && u.isApproved && !u.isSuspended && (
              <button
                onClick={() => handleToggleAgentFeatured(u.id, u.agentProfile ? u.agentProfile.isFeatured !== false : true)}
                disabled={actionLoading}
                className={`w-8 h-8 rounded-full border grid place-items-center transition cursor-pointer ${
                  (u.agentProfile ? u.agentProfile.isFeatured !== false : true)
                    ? "bg-amber-100 text-amber-600 border-amber-300 hover:bg-amber-200"
                    : "bg-white text-slate-300 hover:text-amber-500 hover:border-amber-300 border-line"
                }`}
                title={(u.agentProfile ? u.agentProfile.isFeatured !== false : true) ? "Featured Top Agent on Home Page (Click to unstar)" : "Feature as Top Agent on Home Page"}
              >
                <Star className={`w-4 h-4 ${(u.agentProfile ? u.agentProfile.isFeatured !== false : true) ? "fill-amber-400 text-amber-500" : ""}`} />
              </button>
            )}
            <button
              onClick={() => handleToggleSuspension(u.id, u.isSuspended)}
              disabled={actionLoading}
              className={`w-8 h-8 rounded-full border border-line grid place-items-center transition cursor-pointer ${
                u.isSuspended
                  ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
                  : "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-slate-400"
              }`}
              title={u.isSuspended ? "Unsuspend User" : "Suspend User Account"}
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEditingUser(u);
                setNewRole(u.role);
              }}
              disabled={actionLoading}
              className="w-8 h-8 rounded-full border border-line hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 grid place-items-center transition cursor-pointer text-slate-400"
              title="Edit user details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(u.id)}
              disabled={actionLoading}
              className="w-8 h-8 rounded-full border border-line hover:bg-red-50 hover:text-red-600 hover:border-red-200 grid place-items-center transition cursor-pointer text-slate-400"
              title="Delete user account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8 text-left relative">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
          <Users className="w-6 h-6 text-accent" /> User Directory
        </h2>
        <p className="text-xs text-slate-500 mt-1">Audit platform registrants, adjust credentials, and approve professional roles.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-accent text-primary"
          />
        </div>
        <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          {filtered.length} users listed
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 border-b border-line pb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Pending Approval ({pendingUsers.length})
          </h3>
          <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-xs w-full">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-red-50/50 border-b border-line text-slate-500 font-semibold">
                  <th className="p-4">User ID</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4 hidden sm:table-cell">Contact Info</th>
                  <th className="p-4 text-center">Approval Status</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 text-center">Password</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 text-slate-700">
                {pendingUsers.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 border-b border-line pb-2 mt-4">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> Approved Users ({approvedUsers.length})
        </h3>
        <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-xs w-full">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-secondary/45 border-b border-line text-slate-500 font-semibold">
                <th className="p-4">User ID</th>
                <th className="p-4">User Details</th>
                <th className="p-4 hidden sm:table-cell">Contact Info</th>
                <th className="p-4 text-center">Approval Status</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 text-center">Password</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 text-slate-700">
              {approvedUsers.map(renderUserRow)}
            </tbody>
          </table>
        </div>
      </div>

      {suspendedUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 border-b border-line pb-2 mt-6">
            <UserX className="w-5 h-5 text-amber-600" /> Suspended Accounts ({suspendedUsers.length})
          </h3>
          <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-xs w-full">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-amber-50/50 border-b border-line text-slate-500 font-semibold">
                  <th className="p-4">User ID</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4 hidden sm:table-cell">Contact Info</th>
                  <th className="p-4 text-center">Approval Status</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 text-center">Password</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 text-slate-700">
                {suspendedUsers.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-line pb-3">
              <Edit3 className="w-5 h-5 text-accent" /> Edit User: {editingUser.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">User Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-xs font-semibold bg-secondary text-slate-700 focus:outline-hidden focus:border-accent"
                >
                  <option value="USER">User (Seeker)</option>
                  <option value="OWNER">Owner</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Password (Leave blank to keep unchanged)</label>
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-xs bg-white text-slate-700 focus:outline-hidden focus:border-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-line text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserEdit}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Listed Properties Modal */}
      {selectedUserForProps && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-line rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between p-5 border-b border-line bg-secondary/30">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <Building className="w-5 h-5 text-accent" /> Properties Listed by {selectedUserForProps.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  User ID: {selectedUserForProps.customId || selectedUserForProps.id.substring(0, 8)} • Role: {selectedUserForProps.role}
                </p>
              </div>
              <button
                onClick={() => { setSelectedUserForProps(null); setUserProps([]); }}
                className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {userPropsLoading ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <div className="w-7 h-7 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-mono">Fetching listed properties...</p>
                </div>
              ) : userProps.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-line rounded-xl bg-slate-50/50">
                  <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-sm text-slate-600">No properties listed by this user</p>
                  <p className="text-xs text-slate-400 mt-1">This user hasn't posted any property listings yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProps.map((p) => {
                    const primaryImg = p.images?.[0]?.url || "/placeholder-property.jpg";
                    const isArchived = p.status === "ARCHIVED";
                    const isPending = p.status === "PENDING";
                    return (
                      <div key={p.id} className="border border-line rounded-xl p-3.5 flex gap-3 bg-white hover:border-accent/50 transition shadow-xs">
                        <div className="w-20 h-20 rounded-lg overflow-hidden relative bg-slate-100 shrink-0">
                          <img src={primaryImg} alt={p.title} className="w-full h-full object-cover" />
                          <span className={`absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase ${
                            isArchived ? "bg-red-600" : isPending ? "bg-amber-500" : "bg-emerald-600"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-xs text-primary truncate" title={p.title}>{p.title}</h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                              {p.locality?.name ? `${p.locality.name}, ` : ""}{p.city?.name || "India"}
                            </p>
                            <p className="text-xs font-bold text-accent mt-1">
                              ₹{p.price?.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-line/60">
                            <Link
                              href={`/properties/${p.slug || p.id}`}
                              target="_blank"
                              className="text-[10px] font-semibold text-primary hover:text-accent flex items-center gap-0.5"
                            >
                              View Listing <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                            <Link
                              href={`/dashboard/properties/${p.id}/edit`}
                              className="text-[10px] font-semibold text-slate-500 hover:text-primary flex items-center gap-0.5"
                            >
                              Edit <Pencil className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-xs" onClick={() => setResettingUser(null)}></div>
          <form onSubmit={handleResetPassword} className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-sm w-full z-10 text-xs font-semibold space-y-4">
            <h4 className="font-serif text-sm font-semibold text-primary">Reset Password</h4>
            <p className="text-slate-500 font-normal leading-relaxed text-[10px]">
              You are resetting the password for <span className="font-bold text-primary">{resettingUser.name}</span>. They will be able to log in immediately with the new password.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Password (Min. 8 chars)</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. TempPass123!"
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="border border-line hover:bg-secondary text-slate-500 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="bg-accent text-primary hover:bg-yellow-500 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                {actionLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
