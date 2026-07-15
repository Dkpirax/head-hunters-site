"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Flame, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getJobs, createJob, updateJob, deleteJob } from "./actions";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getJobs().then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const openNew = () => {
    setEditing({ id: "new", title: "", location: "", type: "CASUAL", status: "ACTIVE", isHot: false, description: "" });
    setIsNew(true);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (isNew) {
      await createJob({
        title: editing.title,
        location: editing.location,
        type: editing.type,
        status: editing.status,
        isHot: editing.isHot,
        description: editing.description
      });
    } else {
      await updateJob(editing.id, {
        title: editing.title,
        location: editing.location,
        type: editing.type,
        status: editing.status,
        isHot: editing.isHot,
        description: editing.description
      });
    }
    const updated = await getJobs();
    setJobs(updated);
    setEditing(null);
    setIsNew(false);
    setSaving(false);
  };

  const remove = async (id: string) => {
    try {
      await deleteJob(id);
      const updated = await getJobs();
      setJobs(updated);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete job.");
    }
  };

  const STATUS_COLORS = { ACTIVE: "bg-[#04a891]/15 text-[#04a891]", CLOSED: "bg-white/8 text-white/30", DRAFT: "bg-orange-500/15 text-orange-400" };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Job Listings</h1>
          <p className="text-white/40 text-sm">
            {loading ? "Loading..." : `${jobs.filter((j) => j.status === "ACTIVE").length} active · ${jobs.length} total`}
          </p>
        </div>
        <Button onClick={openNew} variant="solid" size="md">
          <Plus size={15} /> New job
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {["Title", "Location", "Type", "Status", "Hot", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {jobs.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-white/40">No job listings found. Create one to get started.</td></tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/3 transition-colors">
                <td className="px-5 py-4 text-white font-medium">{job.title}</td>
                <td className="px-5 py-4 text-white/50">{job.location}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-white/8 text-white/50 uppercase">{job.type}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase ${STATUS_COLORS[job.status as keyof typeof STATUS_COLORS]}`}>{job.status}</span>
                </td>
                <td className="px-5 py-4">
                  {job.isHot && <Flame size={15} className="text-orange-500" />}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(job); setIsNew(false); }}
                      className="p-1.5 rounded-[6px] text-white/30 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
                      <Pencil size={13} />
                    </button>
                    {deletingId === job.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => remove(job.id)} className="px-2 py-1 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-[4px] uppercase transition-colors">Confirm</button>
                        <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white rounded-[4px] uppercase transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(job.id)}
                        className="p-1.5 rounded-[6px] text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[600px] bg-[#111413] border border-white/10 rounded-[20px] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">{isNew ? "New job listing" : "Edit job listing"}</h2>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {[
                { id: "job-title", label: "Job title", key: "title", placeholder: "e.g. Warehouse Team Member" },
                { id: "job-location", label: "Location", key: "location", placeholder: "e.g. Melbourne, VIC" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input id={f.id} value={editing[f.key as "title" | "location"]}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="job-type" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Type</label>
                  <select id="job-type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                    className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-[#111413] text-white text-sm focus:border-[#04a891]/60 outline-none cursor-pointer">
                    <option value="CASUAL">Casual</option>
                    <option value="PERMANENT">Permanent</option>
                    <option value="REMOTE">Remote</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="job-status" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Status</label>
                  <select id="job-status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-[#111413] text-white text-sm focus:border-[#04a891]/60 outline-none cursor-pointer">
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="job-desc" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Full Description (Markdown)</label>
                <textarea id="job-desc" value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Enter the full job description. You can use markdown for formatting (**bold**, - lists)."
                  className="w-full h-40 px-4 py-3 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all resize-y" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editing.isHot} onChange={(e) => setEditing({ ...editing, isHot: e.target.checked })}
                  className="w-4 h-4 accent-[#02695e]" />
                <span className="text-sm text-white/70">Mark as <span className="text-orange-400 font-semibold">Red Hot Job</span></span>
              </label>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-white/6">
              <Button onClick={save} disabled={saving} variant="solid" size="md" className="gap-2">
                <CheckCircle size={15} /> {saving ? "Saving..." : (isNew ? "Add listing" : "Save changes")}
              </Button>
              <Button onClick={() => setEditing(null)} variant="ghost" size="md">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
