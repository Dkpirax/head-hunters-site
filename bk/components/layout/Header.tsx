"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import { NavLogo } from "@/components/ui/Logo";

const navLinks = [
  { label: "For Employers", href: "/#staff" },
  { label: "For Candidates", href: "/#jobs" },
  { label: "Services", href: "/#services" },
  { label: "Our Story", href: "/#story" },
  { label: "Insights", href: "/insights" },
  { label: "Jobs", href: "/jobs" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        className={cn(
          "hh-header-anim fixed top-3 left-1/2 -translate-x-1/2 z-50",
          "w-[min(1200px,calc(100%-24px))]",
          "h-16 px-3 pl-4",
          "grid grid-cols-[auto_1fr_auto] items-center gap-6",
          "rounded-[12px] border transition-all duration-300",
          scrolled
            ? "border-white/14 bg-[#0B0B0C]/85 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
            : "border-white/8 bg-[#0B0B0C]/50 backdrop-blur-xl"
        )}
        id="top"
      >
        <Link href="/" aria-label="Head Hunters home">
          <NavLogo />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center justify-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2">
          <LinkButton href="/#jobs" variant="ghost" size="sm">Submit CV</LinkButton>
          <LinkButton href="/#contact" variant="solid" size="sm">
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
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-[#0B0B0C]/96 backdrop-blur-2xl" onClick={() => setIsOpen(false)} />
        <div className="absolute inset-x-0 top-24 px-6 space-y-1.5">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center justify-between px-5 py-4 rounded-[12px]",
                "text-lg font-semibold text-white/80 hover:text-white",
                "border border-white/6 hover:border-[#04a891]/30 hover:bg-white/4",
                "transition-all duration-200",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                [
                  "delay-[0ms]",
                  "delay-[40ms]",
                  "delay-[80ms]",
                  "delay-[120ms]",
                  "delay-[160ms]",
                  "delay-[200ms]",
                  "delay-[240ms]",
                  "delay-[280ms]"
                ][i]
              )}
            >
              {link.label}
              <ArrowRight size={16} className="text-[#04a891]" />
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <LinkButton href="/#jobs" variant="ghost" size="lg" className="w-full justify-center" onClick={() => setIsOpen(false)}>
              Submit CV
            </LinkButton>
            <LinkButton href="/#contact" variant="solid" size="lg" className="w-full justify-center" onClick={() => setIsOpen(false)}>
              Talk to a consultant
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
