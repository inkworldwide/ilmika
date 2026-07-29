"use client";

import React, { useState, useEffect } from "react";
import { Users, Trash2, Mail, Phone, ShieldCheck, ShieldAlert, Search, Edit3, UserCheck, UserX, Lock, Key, Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  customId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  plainPassword?: string;
  agentProfile?: {
    id: string;
    companyName: string | null;
    ratingAverage: number;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Modal States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER",
    isApproved: false,
    password: "",
  });

  // Reset Password States
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

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
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isApproved: !currentApproval } : u));
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: editingUser.id,
          ...editForm
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name: editForm.name,
                  email: editForm.email,
                  phone: editForm.phone || null,
                  role: editForm.role,
                  isApproved: editForm.isApproved,
                }
              : u
          )
        );
        setEditingUser(null);
      } else {
        alert(data.error || "Failed to update user details");
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

  // Filter list
  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const pendingUsers = filtered.filter(u => !u.isApproved);
  const approvedUsers = filtered.filter(u => u.isApproved);

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

    // Use a deterministic fallback ID based on the user's UUID if customId is missing
    const deterministicNum = parseInt(u.id.substring(0, 4), 16) % 9000 + 1000;
    const displayId = u.customId || `RE${deterministicNum}`;

    return (
      <tr key={u.id} className="hover:bg-secondary/15 transition">
        <td className="p-4">
          <span className="text-[11px] font-bold text-secondary bg-primary shadow-xs px-2.5 py-1 rounded border border-primary tracking-wider">{displayId}</span>
        </td>
        <td className="p-4">
          <p className="font-semibold text-primary">{u.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-mono text-slate-400">Joined: {dateStr}</p>
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
          <div className="flex justify-center gap-1.5 flex-wrap">
            {u.isEmailVerified ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase">
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Unverified
              </span>
            )}

            {u.isApproved ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase animate-pulse">
                Pending Approval
              </span>
            )}
          </div>
          <div>
            <button
              onClick={() => handleToggleApproval(u.id, u.isApproved)}
              disabled={actionLoading}
              className={`text-[10px] font-semibold underline hover:text-accent cursor-pointer ${
                u.isApproved ? "text-slate-400" : "text-emerald-600 font-bold"
              }`}
            >
              {u.isApproved ? "Revoke Access" : "Approve Access"}
            </button>
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
            <button
              onClick={() => {
                setEditingUser(u);
                setEditForm({
                  name: u.name,
                  email: u.email,
                  phone: u.phone || "",
                  role: u.role,
                  isApproved: u.isApproved,
                  password: u.plainPassword || "",
                });
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

      {/* Search and meta */}
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

      {/* Pending Approval Section */}
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
                  <th className="p-4 text-center">Verification & Approval</th>
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

      {/* Approved Users Section */}
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
                <th className="p-4 text-center">Verification & Approval</th>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-xs" onClick={() => setEditingUser(null)}></div>
          <form onSubmit={handleSaveEdit} className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 text-xs font-semibold space-y-4">
            <h4 className="font-serif text-sm font-semibold text-primary">Edit User Details</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Change Password</label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={(e) => setEditForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-normal leading-normal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="USER">User (Seeker)</option>
                  <option value="OWNER">Owner</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-line">
                <input
                  type="checkbox"
                  id="modal-approved"
                  checked={editForm.isApproved}
                  onChange={(e) => setEditForm(p => ({ ...p, isApproved: e.target.checked }))}
                  className="w-4 h-4 text-accent border-line rounded focus:ring-accent/30 cursor-pointer"
                />
                <label htmlFor="modal-approved" className="text-slate-600 font-semibold cursor-pointer">
                  Approve Account Access
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="border border-line hover:bg-secondary text-slate-500 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="bg-accent text-primary hover:bg-yellow-500 font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
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
