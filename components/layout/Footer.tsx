import Link from "next/link";
import { Mail, MessageCircle, CalendarDays, ArrowUpRight } from "lucide-react";
import { NavLogo } from "@/components/ui/Logo";

const footerLinks = {
  Services: [
    { label: "Executive Search", href: "/#services" },
    { label: "Permanent Placements", href: "/#services" },
    { label: "Labour Hire", href: "/#services" },
    { label: "Remote Staffing", href: "/#services" },
    { label: "Payroll & Bookkeeping", href: "/#services" },
  ],
  Pathways: [
    { label: "Looking for Staff", href: "/#staff" },
    { label: "Looking for a Job", href: "/jobs" },
    { label: "Submit Your CV", href: "/#jobs" },
    { label: "Contact Us", href: "/#contact" },
  ],
  Trust: [
    { label: "Service Standards", href: "/#standards" },
    { label: "Job Scam Awareness", href: "/#resources" },
    { label: "FAQs", href: "/#faq" },
    { label: "Insights", href: "/#resources" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0B0B0C] border-t border-white/8">
      {/* CTA Band */}
      <div className="border-b border-white/8">
        <div className="max-w-[1200px] mx-auto px-5 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-3">
              Ready to hire well?
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Precision hiring.<br />Human results.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold transition-all hover:bg-[#027d6f] hover:shadow-[0_12px_32px_rgba(2,105,94,0.4)]"
            >
              Talk to a consultant
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] border border-white/12 bg-white/6 text-white text-sm font-semibold transition-all hover:bg-white/10"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-[1200px] mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          {/* Brand column */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <NavLogo />
            </Link>
            <p className="text-sm text-white/45 leading-relaxed max-w-[260px]">
              A modern recruitment partner built around people, precision and progress. Serving Australia, New Zealand and Sri Lanka.
            </p>
            <div className="space-y-2.5">
              <a
                href="mailto:hello@headhunters.com.au"
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <Mail size={14} className="text-[#04a891] shrink-0" />
                hello@headhunters.com.au
              </a>
              <Link
                href="/#contact"
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <MessageCircle size={14} className="text-[#04a891] shrink-0" />
                WhatsApp support
              </Link>
              <Link
                href="/#contact"
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <CalendarDays size={14} className="text-[#04a891] shrink-0" />
                Book a call
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-[1200px] mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/28">
          <p>T &amp; C Applies © 2026 Fenra. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
            <span className="text-white/20">|</span>
            <span>Branding by Fenra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
