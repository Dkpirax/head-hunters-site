"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Mail, Check, Archive, Download, AlertCircle, RefreshCw, Trash2, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getEnquiries, updateEnquiryStatus, EnquiryStatus, deleteEnquiry } from "@/app/actions/enquiries";
// @ts-ignore - Suppressing ghost TS error from locked dev server
import type { Enquiry } from "@prisma/client";
import { useSearchParams } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/15 text-blue-400",
  READ: "bg-white/8 text-white/40",
  ASSIGNED: "bg-[#04a891]/15 text-[#04a891]",
  ARCHIVED: "bg-red-400/10 text-red-400/60",
};

const TYPE_STYLES: Record<string, string> = {
  HIRING: "bg-[#02695e]/15 text-[#04a891]",
  CANDIDATE: "bg-blue-500/15 text-blue-400",
  GENERAL: "bg-white/8 text-white/40",
};

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  // Polling enhancements
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchParams = useSearchParams();
  const queryId = searchParams?.get("id");

  useEffect(() => {
    if (queryId && enquiries.length > 0) {
      const match = enquiries.find((e) => e.id === queryId);
      if (match) {
        setSelected(match);
        if (match.status === "NEW") {
          markRead(match.id);
        }
      }
    }
  }, [queryId, enquiries]);

  const loadEnquiries = useCallback(async (isPoll = false) => {
    if (isRefreshing) return;
    if (!isPoll) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await getEnquiries();
      setEnquiries((prev) => {
        if (isPoll && prev.length > 0 && data.length > prev.length) {
          // Found new enquiries
          setHasNewNotification(true);
        }
        return data;
      });
    } catch (e) {
      console.error("Failed to fetch enquiries:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    // Call loadEnquiries at the end of microtask to avoid synchronous setState warning
    Promise.resolve().then(() => loadEnquiries());

    // Poll for new enquiries every 10 seconds
    const interval = setInterval(() => {
      loadEnquiries(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadEnquiries]);

  const markRead = async (id: string) => {
    try {
      await updateEnquiryStatus(id, "READ");
      setEnquiries((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "READ" as EnquiryStatus } : x))
      );
      if (selected?.id === id) {
        setSelected((prev: any) => (prev ? { ...prev, status: "READ" as EnquiryStatus } : null));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const archive = async (id: string) => {
    try {
      await updateEnquiryStatus(id, "ARCHIVED");
      setEnquiries((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "ARCHIVED" as EnquiryStatus } : x))
      );
      if (selected?.id === id) {
        setSelected((prev: any) =>
          prev ? { ...prev, status: "ARCHIVED" as EnquiryStatus } : null
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unarchive = async (id: string) => {
    try {
      await updateEnquiryStatus(id, "READ");
      setEnquiries((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "READ" as EnquiryStatus } : x))
      );
      if (selected?.id === id) {
        setSelected((prev: any) =>
          prev ? { ...prev, status: "READ" as EnquiryStatus } : null
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this enquiry?")) return;
    try {
      await deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((x) => x.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Type", "Message", "Time", "Status"];
    const rows = enquiries.map((e) => [
      e.name,
      e.email,
      e.phone || "",
      e.type,
      `"${e.message.replace(/"/g, '""')}"`,
      e.createdAt,
      e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter list by whether we should display archived items
  const filteredEnquiries = enquiries.filter(
    (e) => showArchived || e.status !== "ARCHIVED"
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Enquiries</h1>
          <p className="text-white/40 text-sm">
            {enquiries.filter((e) => e.status === "NEW").length} unread · {enquiries.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHasNewNotification(false);
              loadEnquiries();
            }}
            disabled={isRefreshing}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-[9px] border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer ${
              isRefreshing ? "animate-spin" : ""
            }`}
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`h-9 px-4 rounded-[9px] border border-white/10 text-sm font-medium transition-all cursor-pointer ${
              showArchived
                ? "bg-[#02695e] text-white border-[#02695e]"
                : "bg-white/5 text-white/60 hover:text-white hover:border-white/20"
            }`}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>

          <button
            onClick={exportCSV}
            disabled={enquiries.length === 0}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* New Enquiries Notification Badge */}
      <AnimatePresence>
        {hasNewNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-4 rounded-[12px] bg-gradient-to-r from-[#02695e]/20 to-[#04a891]/20 border border-[#04a891]/30 flex items-center justify-between text-white text-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-[#04a891] animate-bounce" />
              <span>New enquiries have been received!</span>
            </div>
            <button
              onClick={() => setHasNewNotification(false)}
              className="text-xs font-bold text-[#04a891] hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/3 border border-white/8 rounded-[16px] text-white/40">
          <span className="w-8 h-8 border-2 border-white/10 border-t-[#04a891] rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading enquiries database...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-5">
          {/* Detail panel */}
          <div className="bg-white/3 border border-white/8 rounded-[16px] p-6 h-[600px] flex flex-col justify-between overflow-y-auto">
            {selected ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-5 border-b border-white/6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center text-white font-bold shrink-0">
                    {selected.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {selected.name}
                    </p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-xs text-[#04a891] hover:underline flex items-center gap-1"
                    >
                      <Mail size={10} />
                      {selected.email}
                    </a>
                    {selected.phone && (
                      <p className="text-[10px] text-white/50 mt-0.5 flex items-center gap-1">
                        <Phone size={10} /> {selected.phone}
                      </p>
                    )}
                  </div>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase ${
                      STATUS_STYLES[selected.status]
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-2">
                    Enquiry type
                  </p>
                  <span
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase ${
                      TYPE_STYLES[selected.type]
                    }`}
                  >
                    {selected.type}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-2">
                    Message
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap pt-4 border-t border-white/6">
                  <a
                    href={`mailto:${selected.email}?subject=Head Hunters Enquiry Follow-up`}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] bg-[#02695e] text-white text-sm font-semibold hover:bg-[#027d6f] transition-colors"
                  >
                    <Mail size={13} /> Reply
                  </a>
                  {selected.status !== "READ" && (
                    <button
                      onClick={() => markRead(selected.id)}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:text-white transition-all cursor-pointer"
                    >
                      <Check size={13} /> Mark read
                    </button>
                  )}
                  {selected.status === "ARCHIVED" ? (
                    <button
                      onClick={() => unarchive(selected.id)}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/50 text-sm font-medium hover:text-[#04a891] transition-all cursor-pointer"
                    >
                      <RefreshCw size={13} /> Unarchive
                    </button>
                  ) : (
                    <button
                      onClick={() => archive(selected.id)}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/50 text-sm font-medium hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Archive size={13} /> Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mail size={28} className="text-white/15 mb-3" />
                <p className="text-white/30 text-sm">
                  Select an enquiry to view details
                </p>
              </div>
            )}
          </div>

          {/* List */}
          <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col h-[600px]">
            {filteredEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-white/30">
                <Mail size={32} className="text-white/15 mb-3" />
                <p className="text-sm">No enquiries found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {filteredEnquiries.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      setSelected(e);
                      if (e.status === "NEW") {
                        markRead(e.id);
                      }
                    }}
                    className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-white/4 ${
                      selected?.id === e.id ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center shrink-0 text-white text-xs font-bold shadow-[0_2px_8px_rgba(2,105,94,0.3)]">
                      {e.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-semibold text-white">
                          {e.name}
                        </p>
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                            TYPE_STYLES[e.type]
                          }`}
                        >
                          {e.type}
                        </span>
                        {e.status === "NEW" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-white/40 truncate">
                        {e.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-white/25 shrink-0">
                      <Clock size={10} />
                      {formatRelativeTime(e.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
