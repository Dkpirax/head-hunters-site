"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import { NavLogo } from "@/components/ui/Logo";

const navLinks = [
  { label: "For Employers", href: "/#contact" },
  { label: "For Candidates", href: "/#jobs" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#story" },
  { label: "Insights", href: "/insights" },
  { label: "Jobs", href: "/jobs" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        className={cn(
          "hh-header-anim fixed top-3 left-1/2 -translate-x-1/2 z-[101]",
          "w-[min(1200px,calc(100%-24px))]",
          "h-16 px-4 sm:px-6",
          "flex items-center justify-between gap-4 md:gap-8",
          "rounded-[14px] border transition-all duration-300",
          scrolled
            ? "border-white/14 bg-[#0B0B0C]/85 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
            : "border-white/8 bg-[#0B0B0C]/50 backdrop-blur-xl"
        )}
        id="top"
      >
        <Link to="/" aria-label="Headhunters.lk home" className="flex items-center shrink-0 py-1">
          <NavLogo />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center justify-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2">
          <LinkButton href="/upload-cv" variant="ghost" size="sm">Upload CV</LinkButton>
          <LinkButton href="/contact" variant="solid" size="sm">
            Talk to a consultant <ArrowRight size={13} />
          </LinkButton>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden col-start-3 w-10 h-10 grid place-items-center rounded-[8px] border border-white/12 bg-white/6 text-white cursor-pointer transition-colors hover:bg-white/12"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] lg:hidden transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-[#0B0B0C]/96 backdrop-blur-2xl" onClick={() => setIsOpen(false)} />
        <div className="absolute inset-x-0 top-24 px-6 space-y-1.5 h-[calc(100vh-6rem)] overflow-y-auto pb-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center justify-between px-5 py-4 rounded-[12px]",
                "text-lg font-semibold text-white/80 hover:text-white",
                "border border-white/6 hover:border-[#04a891]/30 hover:bg-white/4",
                "transition-all duration-200",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                [
                  "delay-[0ms]",
                  "delay-[20ms]",
                  "delay-[40ms]",
                  "delay-[60ms]",
                  "delay-[80ms]",
                  "delay-[100ms]",
                  "delay-[120ms]",
                  "delay-[140ms]"
                ][i]
              )}
            >
              {link.label}
              <ArrowRight size={16} className="text-[#04a891]" />
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <LinkButton href="/upload-cv" variant="ghost" size="lg" className="w-full justify-center" onClick={() => setIsOpen(false)}>
              Upload CV
            </LinkButton>
            <LinkButton href="/contact" variant="solid" size="lg" className="w-full justify-center" onClick={() => setIsOpen(false)}>
              Talk to a consultant
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
