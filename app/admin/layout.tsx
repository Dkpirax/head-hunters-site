import type { Metadata } from "next";
import Link from "next/link";
import { NavLogo } from "@/components/ui/Logo";
import { LayoutDashboard, Briefcase, Inbox, FileText, Settings, LogOut, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: { template: "%s | Admin — Head Hunters", default: "Admin — Head Hunters" } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Job Listings", icon: Briefcase },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/insights", label: "Insights", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
