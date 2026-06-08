import type { Metadata } from "next";
import Link from "next/link";
import { NavLogo } from "@/components/ui/Logo";
import { LayoutDashboard, Briefcase, Inbox, MessageSquare, FileText, Users, Settings, LogOut, ExternalLink } from "lucide-react";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: { template: "%s | Admin — Head Hunters", default: "Admin — Head Hunters" } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Job Listings", icon: Briefcase },
  { href: "/admin/insights", label: "Insights", icon: FileText },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/chat", label: "Chats", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "";
  const initial = userName[0].toUpperCase();
  const role = (session?.user as { role?: string })?.role || "ADMIN";

  return (
    <div className="min-h-screen bg-[#0f1110] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/6 flex flex-col bg-[#0B0B0C]">
        <div className="p-5 border-b border-white/6">
          <Link href="/admin"><NavLogo /></Link>
          <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest mt-2 ml-11">Admin portal</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-150 group"
            >
              <Icon size={16} className="group-hover:text-[#04a891] transition-colors" strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/6 space-y-0.5">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-white/30 hover:text-white/60 transition-all">
            <ExternalLink size={15} strokeWidth={1.8} /> View live site
          </Link>
          <Link href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut size={15} strokeWidth={1.8} /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="h-16 shrink-0 border-b border-white/6 flex items-center justify-end px-8 bg-[#0B0B0C]/40 backdrop-blur-md sticky top-0 z-20 gap-4">
          <AdminNotifications />
          <div className="flex items-center gap-2.5 pl-4 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center text-white text-xs font-black shadow-sm uppercase cursor-default select-none" title={`${userName} (${userEmail})`}>
              {initial}
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-bold text-white leading-none truncate max-w-[100px]">{userName}</span>
              <span className="text-[9px] text-white/40 leading-none mt-1 uppercase tracking-wider">{role.replace("_", " ")}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
