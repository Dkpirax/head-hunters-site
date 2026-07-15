import { Link } from "react-router-dom";
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

const defaultFooterSettings = {
  notifyEmails: "hello@headhunters.com.au",
  whatsappNumber: "",
  calendlyLink: "",
  linkedin_url: "https://linkedin.com/company/headhunters",
  twitter_url: "https://twitter.com/headhunters",
  facebook_url: "https://facebook.com/headhunters",
  copyright_text: "© 2026 Head Hunters. All rights reserved.",
  ios_app_url: "",
  android_app_url: "",
};

export function Footer({ settings }: { settings?: any }) {
  const s = {
    ...defaultFooterSettings,
    ...settings,
    notifyEmails: settings?.email_notify_list || settings?.notifyEmails || defaultFooterSettings.notifyEmails,
    whatsappNumber: settings?.integration_whatsapp_number || settings?.whatsappNumber || defaultFooterSettings.whatsappNumber,
    calendlyLink: settings?.integration_calendly_url || settings?.calendlyLink || defaultFooterSettings.calendlyLink,
  };

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
              to="/#contact"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold transition-all hover:bg-[#027d6f] hover:shadow-[0_12px_32px_rgba(2,105,94,0.4)]"
            >
              Talk to a consultant
              <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/jobs"
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
            <Link to="/" className="inline-flex items-center gap-2.5">
              <NavLogo />
            </Link>
            <p className="text-sm text-white/45 leading-relaxed max-w-[260px]">
              A modern recruitment partner built around people, precision and progress. Serving Australia, New Zealand and Sri Lanka.
            </p>
            <div className="space-y-2.5">
              <a
                href={`mailto:${s.notifyEmails}`}
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <Mail size={14} className="text-[#04a891] shrink-0" />
                {s.notifyEmails}
              </a>
              <a
                href={s.whatsappNumber ? `https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, "")}` : "/#contact"}
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <MessageCircle size={14} className="text-[#04a891] shrink-0" />
                WhatsApp support
              </a>
              <a
                href={s.calendlyLink || "/#contact"}
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <CalendarDays size={14} className="text-[#04a891] shrink-0" />
                Book a call
              </a>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/4 max-w-[260px]">
              {s.linkedin_url && (
                <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-[11px] font-semibold">
                  LinkedIn
                </a>
              )}
              {s.twitter_url && (
                <a href={s.twitter_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-[11px] font-semibold">
                  Twitter
                </a>
              )}
              {s.facebook_url && (
                <a href={s.facebook_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-[11px] font-semibold">
                  Facebook
                </a>
              )}
            </div>

            {(s.ios_app_url || s.android_app_url) && (
              <div className="flex gap-2 pt-1 max-w-[260px]">
                {s.ios_app_url && (
                  <a href={s.ios_app_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-[6px] border border-white/8 bg-white/2 hover:bg-white/5 text-[10px] text-white/60 hover:text-white font-bold transition-all">
                    iOS App
                  </a>
                )}
                {s.android_app_url && (
                  <a href={s.android_app_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-[6px] border border-white/8 bg-white/2 hover:bg-white/5 text-[10px] text-white/60 hover:text-white font-bold transition-all">
                    Android App
                  </a>
                )}
              </div>
            )}
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
                      to={link.href}
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
          <p>{s.copyright_text}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white/60 transition-colors">
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
