"use client";

import { useState } from "react";
import { Clock, Mail, Check, Archive, Download } from "lucide-react";

const ENQUIRIES = [
  { id: "1", name: "Sarah Mitchell", email: "s.mitchell@logistics.com.au", type: "Hiring", message: "Need 4 warehouse staff urgently for Friday loading shift. All must have forklift licence.", time: "12m ago", status: "NEW" },
  { id: "2", name: "James Tan", email: "james.t@gmail.com", type: "Candidate", message: "Looking for bookkeeping roles in New Zealand. 6 years Xero experience. Available immediately.", time: "1h ago", status: "NEW" },
  { id: "3", name: "Priya Fernando", email: "priya.f@techco.lk", type: "General", message: "Question about your remote staffing solutions — specifically virtual assistant packages for Australian clients.", time: "3h ago", status: "READ" },
  { id: "4", name: "David Clarke", email: "d.clarke@innovate.com.au", type: "Hiring", message: "Executive search for Operations Director. Confidential. Brisbane-based or open to relocation.", time: "5h ago", status: "ASSIGNED" },
  { id: "5", name: "Amara Silva", email: "amara.s@yahoo.com", type: "Candidate", message: "Customer service background, 4 years call centre management. Looking for permanent role in Melbourne.", time: "1d ago", status: "READ" },
];

type Enquiry = typeof ENQUIRIES[0];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/15 text-blue-400",
  READ: "bg-white/8 text-white/40",
  ASSIGNED: "bg-[#04a891]/15 text-[#04a891]",
  ARCHIVED: "bg-red-400/10 text-red-400/60",
};

const TYPE_STYLES: Record<string, string> = {
  Hiring: "bg-[#02695e]/15 text-[#04a891]",
  Candidate: "bg-blue-500/15 text-blue-400",
  General: "bg-white/8 text-white/40",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState(ENQUIRIES);
  const [selected, setSelected] = useState<Enquiry | null>(null);

  const markRead = (id: string) => setEnquiries((e) => e.map((x) => x.id === id ? { ...x, status: "READ" } : x));
  const archive = (id: string) => setEnquiries((e) => e.map((x) => x.id === id ? { ...x, status: "ARCHIVED" } : x));

  const exportCSV = () => {
    const headers = ["Name", "Email", "Type", "Message", "Time", "Status"];
    const rows = enquiries.map((e) => [e.name, e.email, e.type, `"${e.message}"`, e.time, e.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Enquiries</h1>
          <p className="text-white/40 text-sm">
            {enquiries.filter((e) => e.status === "NEW").length} unread · {enquiries.length} total
          </p>
        </div>
        <button onClick={exportCSV}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 transition-all cursor-pointer">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5">
        {/* List */}
        <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden">
          <div className="divide-y divide-white/4">
            {enquiries.map((e) => (
              <div key={e.id}
                onClick={() => { setSelected(e); markRead(e.id); }}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-white/4 ${selected?.id === e.id ? "bg-white/5" : ""}`}>
                <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 text-white text-xs font-bold bg-gradient-to-br from-[#02695e] to-[#04a891]`}>
                  {e.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-white">{e.name}</p>
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${TYPE_STYLES[e.type]}`}>{e.type}</span>
                    {e.status === "NEW" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </div>
                  <p className="text-xs text-white/40 truncate">{e.message}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/25 shrink-0">
                  <Clock size={10} />{e.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-white/3 border border-white/8 rounded-[16px] p-6">
          {selected ? (
            <div>
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center text-white font-bold shrink-0">
                  {selected.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="text-xs text-[#04a891] hover:underline flex items-center gap-1">
                    <Mail size={10} />{selected.email}
                  </a>
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-2">Enquiry type</p>
                <span className={`px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase ${TYPE_STYLES[selected.type]}`}>{selected.type}</span>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-2">Message</p>
                <p className="text-white/70 text-sm leading-relaxed">{selected.message}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <a href={`mailto:${selected.email}`}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] bg-[#02695e] text-white text-sm font-semibold hover:bg-[#027d6f] transition-colors">
                  <Mail size={13} /> Reply
                </a>
                <button onClick={() => markRead(selected.id)}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:text-white transition-all cursor-pointer">
                  <Check size={13} /> Mark read
                </button>
                <button onClick={() => archive(selected.id)}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-[9px] border border-white/10 bg-white/5 text-white/50 text-sm font-medium hover:text-red-400 transition-all cursor-pointer">
                  <Archive size={13} /> Archive
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Mail size={28} className="text-white/15 mb-3" />
              <p className="text-white/30 text-sm">Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
