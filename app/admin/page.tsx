import type { Metadata } from "next";
import { Inbox, Briefcase, Users, TrendingUp, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

const STATS = [
  { label: "Open Jobs", value: "6", delta: "+2 this week", icon: Briefcase, color: "text-[#04a891]" },
  { label: "New Enquiries", value: "12", delta: "4 unread", icon: Inbox, color: "text-blue-400" },
  { label: "CVs Received", value: "28", delta: "+8 this month", icon: Users, color: "text-purple-400" },
  { label: "Avg. Response", value: "47m", delta: "Under 1h target ✓", icon: TrendingUp, color: "text-[#04a891]" },
];

const RECENT_ENQUIRIES = [
  { name: "Sarah Mitchell", type: "Hiring", message: "Need 4 warehouse staff urgently for Friday...", time: "12m ago", unread: true },
  { name: "James Tan", type: "Candidate", message: "Looking for bookkeeping roles in NZ...", time: "1h ago", unread: true },
  { name: "Priya Fernando", type: "General", message: "Question about your remote staffing solutions...", time: "3h ago", unread: false },
  { name: "David Clarke", type: "Hiring", message: "Executive search for Operations Director role...", time: "5h ago", unread: false },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Head Hunters Workforce Management · {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/4 border border-white/8 rounded-[14px] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{s.label}</p>
                <Icon size={16} className={s.color} strokeWidth={1.8} />
              </div>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-xs text-white/35">{s.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Recent enquiries */}
        <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
            <h2 className="text-white font-bold text-sm">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-xs text-[#04a891] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-white/4">
            {RECENT_ENQUIRIES.map((e, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors cursor-pointer">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center shrink-0 text-white text-xs font-bold">
                  {e.name[0]}
                  {e.unread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 border border-[#0B0B0C]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white">{e.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                      e.type === "Hiring" ? "bg-[#02695e]/20 text-[#04a891]" :
                      e.type === "Candidate" ? "bg-blue-500/15 text-blue-400" :
                      "bg-white/8 text-white/40"
                    }`}>{e.type}</span>
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

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-[16px] p-6">
            <h2 className="text-white font-bold text-sm mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              {[
                { label: "Post a new job", href: "/admin/jobs", color: "bg-[#02695e] text-white" },
                { label: "View all enquiries", href: "/admin/enquiries", color: "bg-white/8 text-white" },
                { label: "Edit site content", href: "/admin/content", color: "bg-white/8 text-white" },
                { label: "Export enquiries CSV", href: "/api/enquiries/export", color: "bg-white/8 text-white" },
              ].map((a) => (
                <Link key={a.label} href={a.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 ${a.color}`}>
                  {a.label}
                  <ArrowRight size={14} className="opacity-60" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#02695e]/10 border border-[#02695e]/20 rounded-[16px] p-6">
            <p className="text-[#04a891] text-xs font-bold uppercase tracking-wider mb-2">Service standard</p>
            <p className="text-white font-black text-3xl mb-1">1h</p>
            <p className="text-white/50 text-xs">Target response time. Current average: 47 min ✓</p>
          </div>
        </div>
      </div>
    </div>
  );
}
