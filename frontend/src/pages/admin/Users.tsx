import React, { useState, useEffect } from "react";
import { Users as UsersIcon, Plus, Mail, UserCheck, Trash2, Edit2, Key, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  permissions?: string[];
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiClient("/api/admin/users");
      setUsers(data.users);
      setAllPermissions(data.permissions);
      setCurrentUserEmail(data.currentUserEmail);
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const currentUser = users.find((u) => u.email.toLowerCase() === currentUserEmail.toLowerCase());
  const isCurrentUserSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const resetForm = () => {
    setEmail("");
    setName("");
    setRole("ADMIN");
    setPassword("");
    setSelectedPermissions([]);
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
      await apiClient("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ email, name, role, password, permissions: selectedPermissions })
      });
      await fetchUsers();
      setSuccessMessage(`Administrator ${email} created successfully.`);
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create user.");
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
      await apiClient(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ email, name, role, password, permissions: selectedPermissions })
      });
      await fetchUsers();
      setSuccessMessage(`Administrator details updated.`);
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update user.");
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
      await apiClient(`/api/admin/users/${id}`, { method: "DELETE" });
      await fetchUsers();
      setSuccessMessage(`Account deleted successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete account.");
    }
  };

  const handleSendReset = async (id: string, userEmail: string) => {
    try {
      await apiClient(`/api/admin/users/${id}/reset`, { method: "POST" });
      setSuccessMessage(`Password reset instructions sent to ${userEmail}.`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to send reset email.");
    }
  };

  const handleStartEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEmail(user.email);
    setName(user.name || "");
    setRole(user.role);
    setPassword("");
    setSelectedPermissions(user.permissions || []);
    setErrorMessage("");
    setIsAdding(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="p-8 text-white">Loading users...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
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

      {successMessage && (
        <div className="mb-6 p-4 rounded-[10px] bg-[#02695e]/15 border border-[#04a891]/25 text-[#04a891] text-xs font-semibold shrink-0">
          {successMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start flex-1 min-h-0">
        <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col h-full min-h-0">
          <div className="p-4 border-b border-white/6 bg-white/1 flex items-center justify-between gap-4 shrink-0">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">Dashboard Logins</h2>
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 px-3 rounded-[6px] border border-white/8 bg-white/5 text-white placeholder:text-white/20 text-xs focus:border-[#04a891]/50 outline-none w-48 transition-all"
            />
          </div>

          <div className="divide-y divide-white/4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-white/30 text-xs flex flex-col items-center justify-center gap-2">
                <UsersIcon size={24} className="text-white/10" />
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
                        onClick={() => handleSendReset(u.id, u.email)}
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
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    </select>
                  </div>

                  {isCurrentUserSuperAdmin && role !== "SUPER_ADMIN" && (
                    <div className="space-y-2 mt-4 border-t border-white/6 pt-3">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide">
                        Assign Permissions
                      </label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                        {allPermissions.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm);
                          return (
                            <label key={perm} className="flex items-center gap-2 text-white/70 hover:text-white text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions((prev) => [...prev, perm]);
                                  } else {
                                    setSelectedPermissions((prev) => prev.filter((p) => p !== perm));
                                  }
                                }}
                                className="w-3.5 h-3.5 text-[#04a891] border-white/10 rounded accent-[#02695e]"
                              />
                              <span className="capitalize">{perm.replace(/_/g, " ")}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
