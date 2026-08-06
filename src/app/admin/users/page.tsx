"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Search,
  Edit3,
  UserX,
  MapPin,
  Info,
  X,
  Calendar,
} from "lucide-react";

interface User {
  id: string;
  customId: string | null;
  name: string;
  email: string;
  phone: string | null;
  city?: string | null;
  country?: string | null;
  role: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isSuspended: boolean;
  createdAt: string;
  plainPassword?: string;
  colleges?: {
    city?: {
      name: string;
    };
  }[];
  collegeProfile?: {
    id: string;
    organizationName: string | null;
    ratingAverage: number;
    isFeatured?: boolean;
  } | null;
}

const ROLE_BADGES: Record<string, { label: string; bg: string }> = {
  ADMIN: { label: "Admin", bg: "bg-purple-100 text-purple-800 border-purple-200 font-bold" },
  AGENT: { label: "Advisor", bg: "bg-amber-100 text-amber-800 border-amber-200 font-bold" },
  COLLEGE_ADMIN: { label: "College Admin", bg: "bg-blue-100 text-blue-800 border-blue-200 font-bold" },
  OWNER: { label: "College Admin", bg: "bg-blue-100 text-blue-800 border-blue-200 font-bold" },
  USER: { label: "Student", bg: "bg-slate-100 text-slate-700 border-slate-200 font-medium" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");

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
          city: newCity || undefined,
          country: newCountry || undefined,
          password: newPassword || undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === editingUser.id ? { ...u, role: newRole, city: newCity || u.city, country: newCountry || u.country } : u)
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

  const handleDelete = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
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
    (u.phone && u.phone.includes(search)) ||
    (u.city && u.city.toLowerCase().includes(search.toLowerCase())) ||
    (u.country && u.country.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingUsers = filtered.filter(u => !u.isApproved && !u.isSuspended);
  const approvedUsers = filtered.filter(u => u.isApproved && !u.isSuspended);
  const suspendedUsers = filtered.filter(u => u.isSuspended);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono">Loading user directory...</p>
      </div>
    );
  }

  const renderUserRow = (u: User) => {
    const dateStr = new Date(u.createdAt).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });

    const deterministicNum = parseInt(u.id.substring(0, 4), 16) % 9000 + 1000;
    let displayId = u.customId;
    if (!displayId || displayId.startsWith("RE")) {
      displayId = `ID-${deterministicNum}`;
    }

    return (
      <tr key={u.id} className="hover:bg-slate-50/80 transition group border-b border-slate-100">
        {/* User ID */}
        <td className="p-4 whitespace-nowrap">
          <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md tracking-wider">
            {displayId}
          </span>
        </td>

        {/* User Details (Clickable to view location & full details) */}
        <td className="p-4 cursor-pointer group/name" onClick={() => setViewingUser(u)} title="Click to view full user details">
          <div>
            <p className="font-bold text-primary text-xs flex items-center gap-1.5 group-hover/name:text-accent transition">
              {u.name.replace(/\s*\([^)]*\)/g, "").trim()}
              <Info className="w-3.5 h-3.5 text-slate-400 group-hover/name:text-accent shrink-0" />
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Joined: {dateStr}</p>
          </div>
        </td>

        {/* Contact Info */}
        <td className="p-4">
          <p className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate max-w-[200px]">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {u.email}
          </p>
          {u.phone && (
            <p className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {u.phone}
            </p>
          )}
        </td>

        {/* Status */}
        <td className="p-4 text-center whitespace-nowrap">
          <div className="flex flex-col items-center gap-1">
            {u.isSuspended ? (
              <span className="inline-flex text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">Suspended</span>
            ) : u.isApproved ? (
              <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">Approved</span>
            ) : (
              <span className="inline-flex text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 uppercase animate-pulse">Pending</span>
            )}
            <div>
              {u.isSuspended ? (
                <button onClick={() => handleToggleSuspension(u.id, true)} disabled={actionLoading}
                  className="text-[10px] font-bold text-emerald-600 underline hover:text-accent cursor-pointer">
                  Unsuspend
                </button>
              ) : (
                <button onClick={() => handleToggleApproval(u.id, u.isApproved)} disabled={actionLoading}
                  className={`text-[10px] font-bold underline hover:text-accent cursor-pointer ${
                    u.isApproved ? "text-slate-400" : "text-emerald-600"
                  }`}>
                  {u.isApproved ? "Revoke" : "Approve"}
                </button>
              )}
            </div>
          </div>
        </td>

        {/* Role Selector (4 Roles: Student, College Admin, Advisor, Admin) */}
        <td className="p-4 whitespace-nowrap">
          <select value={u.role === "OWNER" ? "COLLEGE_ADMIN" : u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={actionLoading}
            className={`border rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:border-accent min-w-[130px] cursor-pointer ${ROLE_BADGES[u.role]?.bg || ""}`}>
            <option value="USER">Student</option>
            <option value="COLLEGE_ADMIN">College Admin</option>
            <option value="AGENT">Advisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </td>

        {/* Action Buttons */}
        <td className="p-4 text-right whitespace-nowrap">
          <div className="flex justify-end items-center gap-1.5">
            <button onClick={() => setViewingUser(u)}
              className="w-7 h-7 rounded-xl border border-slate-200 hover:bg-slate-100 grid place-items-center transition cursor-pointer text-slate-500"
              title="View full user details">
              <Info className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleToggleSuspension(u.id, u.isSuspended)} disabled={actionLoading}
              className={`w-7 h-7 rounded-xl border border-slate-200 grid place-items-center transition cursor-pointer ${
                u.isSuspended ? "bg-amber-500 text-white border-amber-500" : "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-slate-400"
              }`} title={u.isSuspended ? "Unsuspend" : "Suspend"}>
              <UserX className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setEditingUser(u); setNewRole(u.role); setNewCity(u.city || ""); setNewCountry(u.country || ""); }} disabled={actionLoading}
              className="w-7 h-7 rounded-xl border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 grid place-items-center transition cursor-pointer text-slate-400"
              title="Edit user">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(u.id)} disabled={actionLoading}
              className="w-7 h-7 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 grid place-items-center transition cursor-pointer text-slate-400"
              title="Delete user">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" /> User Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit platform registrants, adjust credentials, and approve professional roles.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-accent text-primary font-medium"
          />
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-base text-primary font-bold flex items-center gap-2 border-b border-slate-200 pb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Pending Approval ({pendingUsers.length})
          </h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full border-collapse text-xs text-left min-w-[700px]">
              <thead>
                <tr className="bg-red-50/50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-4">User ID</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-serif text-base text-primary font-bold flex items-center gap-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Approved Users ({approvedUsers.length})
        </h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full border-collapse text-xs text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-4">User ID</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvedUsers.map(renderUserRow)}
            </tbody>
          </table>
        </div>
      </div>

      {suspendedUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-base text-primary font-bold flex items-center gap-2 border-b border-slate-200 pb-2 pt-4">
            <UserX className="w-5 h-5 text-amber-600" /> Suspended Accounts ({suspendedUsers.length})
          </h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full border-collapse text-xs text-left min-w-[700px]">
              <thead>
                <tr className="bg-amber-50/50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-4">User ID</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suspendedUsers.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Information Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-accent grid place-items-center font-bold text-base">
                  {viewingUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">{viewingUser.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ID: {viewingUser.customId || `ID-${parseInt(viewingUser.id.substring(0, 4), 16) % 9000 + 1000}`}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Registered Location</p>
                <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span>
                    {viewingUser.city && viewingUser.country 
                      ? `${viewingUser.city}, ${viewingUser.country}` 
                      : viewingUser.city || viewingUser.country || "Not Specified"}
                  </span>
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Account Role</p>
                <p className="font-semibold text-slate-800 capitalize">
                  {viewingUser.role === "COLLEGE_ADMIN" || viewingUser.role === "OWNER" 
                    ? "College Admin" 
                    : viewingUser.role === "AGENT" ? "Advisor" : viewingUser.role.toLowerCase()}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Account Status</p>
                <p className="font-semibold text-emerald-700 uppercase text-[11px]">
                  {viewingUser.isSuspended ? "Suspended" : viewingUser.isApproved ? "Approved" : "Pending"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Email Address</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {viewingUser.email}
                </p>
              </div>

              {viewingUser.phone && (
                <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2">
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Phone Number</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {viewingUser.phone}
                  </p>
                </div>
              )}

              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Member Since</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(viewingUser.createdAt).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-slate-200 pb-3">
              <Edit3 className="w-5 h-5 text-accent" /> Edit User: {editingUser.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">User Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:border-accent"
                >
                  <option value="USER">Student</option>
                  <option value="COLLEGE_ADMIN">College Admin</option>
                  <option value="AGENT">Advisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserEdit}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-primary font-bold text-xs transition"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
