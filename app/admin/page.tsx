import type { Metadata } from "next";
import { Inbox, Briefcase, Users, TrendingUp, ArrowRight, Clock, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

function formatRelativeTime(date: Date | string) {
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

export default async function AdminDashboard() {
  // Query live database counts
  const openJobsCount = await prisma.job.count({
    where: { status: "ACTIVE" }
  });

  const totalEnquiriesCount = await prisma.enquiry.count();
  const unreadEnquiriesCount = await prisma.enquiry.count({
    where: { status: "NEW" }
  });

  const cvsCount = await prisma.enquiry.count({
    where: { type: "CANDIDATE" }
  });

  const recentEnquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 4
  });

  const recentChats = await prisma.conversation.findMany({
    where: {
      status: { in: ["BOT_ACTIVE", "HUMAN_ACTIVE"] }
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 4
  });

  // Calculate Avg Response time from messages
  const conversationsForStats = await prisma.conversation.findMany({
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let totalDiffMins = 0;
  let sampleCount = 0;

  for (const c of conversationsForStats) {
    let pendingUserMessageTime: Date | null = null;
    for (const m of c.messages) {
      if (m.senderType === "USER") {
        if (!pendingUserMessageTime) {
          pendingUserMessageTime = m.createdAt;
        }
      } else if (m.senderType === "ADMIN") {
        if (pendingUserMessageTime) {
          const diffMs = m.createdAt.getTime() - pendingUserMessageTime.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins >= 0) {
            totalDiffMins += diffMins;
            sampleCount++;
          }
          pendingUserMessageTime = null;
        }
      }
    }
  }

  const avgResponseMin = sampleCount > 0 ? Math.round(totalDiffMins / sampleCount) : 0;
  const avgResponseText = avgResponseMin > 0 ? `${avgResponseMin}m` : "Under 5m";
  const avgResponseDelta = avgResponseMin < 60 ? "Under 1h target ✓" : "Above 1h target";

  const STATS = [
    { label: "Open Jobs", value: openJobsCount.toString(), delta: "Live active vacancies", icon: Briefcase, color: "text-[#04a891]" },
    { label: "New Enquiries", value: totalEnquiriesCount.toString(), delta: `${unreadEnquiriesCount} unread / pending`, icon: Inbox, color: "text-blue-400" },
    { label: "CVs Received", value: cvsCount.toString(), delta: "Collected via portal & chat", icon: Users, color: "text-purple-400" },
    { label: "Avg. Response", value: avgResponseText, delta: `${avgResponseDelta}`, icon: TrendingUp, color: "text-[#04a891]" },
  ];

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
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent enquiries */}
            <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col h-[350px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
                <h2 className="text-white font-bold text-sm">Recent Enquiries</h2>
                <Link href="/admin/enquiries" className="text-xs text-[#04a891] font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 flex-1">
                {recentEnquiries.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-xs">
                    No recent enquiries found.
                  </div>
                ) : (
                  recentEnquiries.map((e) => (
                    <Link
                      key={e.id}
                      href={`/admin/enquiries?id=${e.id}`}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors cursor-pointer block"
                    >
                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center shrink-0 text-white text-xs font-bold shadow-md">
                        {e.name[0]}
                        {e.status === "NEW" && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 border border-[#0B0B0C]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-bold text-white truncate max-w-[120px]">{e.name}</p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] uppercase ${
                            e.type === "HIRING" ? "bg-[#02695e]/20 text-[#04a891]" :
                            e.type === "CANDIDATE" ? "bg-blue-500/15 text-blue-400" :
                            "bg-white/8 text-white/40"
                          }`}>{e.type}</span>
                        </div>
                        <p className="text-[11px] text-white/40 truncate">{e.message}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/20 shrink-0">
                        <Clock size={10} />{formatRelativeTime(e.createdAt)}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Active Chats */}
            <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col h-[350px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
                <h2 className="text-white font-bold text-sm">Active Chats</h2>
                <Link href="/admin/chat" className="text-xs text-[#04a891] font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 flex-1">
                {recentChats.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-xs">
                    No active chats found.
                  </div>
                ) : (
                  recentChats.map((c) => {
                    const lastMsg = c.messages[0];
                    const displayName = `Visitor #${c.userId.substring(c.userId.length - 4)}`;
                    return (
                      <Link
                        key={c.id}
                        href={`/admin/chat?select=${c.id}`}
                        className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors cursor-pointer block"
                      >
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center shrink-0 text-white text-xs font-bold shadow-md">
                          V
                          {c.needsHuman && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-[#0B0B0C] animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-bold text-white truncate max-w-[120px]">{displayName}</p>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] uppercase ${
                              c.status === "HUMAN_ACTIVE" ? "bg-[#04a891]/20 text-[#04a891]" : "bg-blue-500/15 text-blue-400"
                            }`}>{c.status === "HUMAN_ACTIVE" ? "Human" : "Bot"}</span>
                            {c.needsHuman && (
                              <AlertCircle size={10} className="text-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-white/40 truncate">{lastMsg ? lastMsg.content : "No messages yet"}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/20 shrink-0">
                          <Clock size={10} />{formatRelativeTime(c.updatedAt)}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
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
                { label: "Export enquiries CSV", href: "/api/enquiries/export", color: "bg-[#0B0B0C] border border-white/10 text-white" },
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
            <p className="text-white/50 text-xs">Target response time. Current average: {avgResponseText} {avgResponseMin < 60 ? "✓" : "⚠️"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
