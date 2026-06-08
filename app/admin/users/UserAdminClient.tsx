"use client";

import React, { useState } from "react";
import { Users, Plus, Shield, Mail, Calendar, UserCheck, Trash2, Edit2, Key, X } from "lucide-react";
import { createAdminUser, updateAdminUser, deleteAdminUser, sendResetEmail } from "@/app/actions/users";
import { motion, AnimatePresence } from "framer-motion";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string | Date;
}

export default function UserAdminClient({
  initialUsers,
  currentUserEmail,
}: {
  initialUsers: AdminUser[];
  currentUserEmail: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setName("");
    setRole("ADMIN");
    setPassword("");
    setErrorMessage("");
    setIsAdding(false);
    setEditingUser(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const created = await createAdminUser({ email, name, role, password });
      setUsers((prev) => [
        {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role,
          createdAt: created.createdAt,
        },
        ...prev,
      ]);
      setSuccessMessage(`Administrator ${email} created successfully.`);
      resetForm();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateAdminUser(editingUser.id, { email, name, role, password });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, email: updated.email, name: updated.name, role: updated.role }
            : u
        )
      );
      setSuccessMessage(`Administrator details updated.`);
      resetForm();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (userEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
      alert("You cannot delete your own logged-in administrator account!");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete admin login for ${userEmail}?`)) return;

    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccessMessage(`Account deleted successfully.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete account.");
    }
  };

  const handleSendReset = async (userEmail: string) => {
    try {
      await sendResetEmail(userEmail);
      setSuccessMessage(`Password reset instructions sent to ${userEmail}.`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send reset email.");
    }
  };

  const handleStartEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEmail(user.email);
    setName(user.name || "");
    setRole(user.role);
    setPassword(""); // Keep blank unless resetting
    setErrorMessage("");
    setIsAdding(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">User Management</h1>
          <p className="text-white/40 text-sm">Create and configure dashboard logins for recruitment consultants.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-[#02695e] hover:bg-[#027d6f] text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(2,105,94,0.2)] cursor-pointer"
        >
          <Plus size={14} /> Add Admin User
        </button>
      </div>

      {/* Message alerts */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-[10px] bg-[#02695e]/15 border border-[#04a891]/25 text-[#04a891] text-xs font-semibold">
          {successMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Users Table */}
        <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-white/6 bg-white/1 flex items-center justify-between gap-4">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">Dashboard Logins</h2>
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 px-3 rounded-[6px] border border-white/8 bg-white/5 text-white placeholder:text-white/20 text-xs focus:border-[#04a891]/50 outline-none w-48 transition-all"
            />
          </div>

          <div className="divide-y divide-white/4 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/10">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-white/30 text-xs flex flex-col items-center justify-center gap-2">
                <Users size={24} className="text-white/10" />
                <span>No admin logins found.</span>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <div key={u.id} className="p-4 hover:bg-white/1 transition-all flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center text-white text-xs font-black shrink-0 shadow-sm uppercase">
                        {u.name ? u.name[0] : u.email[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-white truncate max-w-[150px]">
                            {u.name || "No Display Name"}
                          </p>
                          <span
                            className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-[4px] uppercase ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/10"
                                : "bg-blue-500/15 text-blue-400"
                            }`}
                          >
                            {u.role}
                          </span>
                          {isSelf && (
                            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-[4px]">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5">
                          <Mail size={10} /> {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSendReset(u.email)}
                        className="w-8 h-8 rounded-[8px] border border-white/6 bg-white/2 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400 text-white/45 flex items-center justify-center transition-all cursor-pointer"
                        title="Send Password Reset Email"
                      >
                        <Key size={12} />
                      </button>
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="w-8 h-8 rounded-[8px] border border-white/6 bg-white/2 hover:bg-white/8 hover:text-white text-white/50 flex items-center justify-center transition-all cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={isSelf}
                        className="w-8 h-8 rounded-[8px] border border-white/6 bg-white/2 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-white/40 flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Panel */}
        <AnimatePresence mode="wait">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/3 border border-white/8 rounded-[16px] p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/6 pb-3 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {editingUser ? "Edit Admin User" : "Add Admin User"}
                  </h3>
                  <button onClick={resetForm} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                    <X size={14} />
                  </button>
                </div>

                {errorMessage && (
                  <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-[8px] text-[10px] font-bold">
                    {errorMessage}
                  </p>
                )}

                <form onSubmit={editingUser ? handleUpdate : handleCreate} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-9 px-3.5 rounded-[8px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-9 px-3.5 rounded-[8px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                      placeholder="jane@headhunters.com.au"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-9 px-3.5 rounded-[8px] border border-white/8 bg-[#181a19] text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide">
                        {editingUser ? "Reset Password" : "Password"}
                      </label>
                      {editingUser && (
                        <span className="text-[8px] text-white/30">(Leave blank to keep current)</span>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-9 px-3.5 rounded-[8px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                      placeholder="••••••••"
                      required={!editingUser}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/6 mt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="h-8.5 px-3.5 rounded-[8px] border border-white/10 bg-white/5 text-white/60 text-xs font-semibold hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 h-8.5 px-4 rounded-[8px] bg-[#02695e] hover:bg-[#027d6f] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                    >
                      {isSubmitting ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck size={12} /> {editingUser ? "Save User" : "Add User"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
