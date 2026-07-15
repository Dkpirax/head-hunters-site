"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";

const HeroBackground = dynamic(() => import("@/components/home/HeroBackground").then(mod => mod.HeroBackground), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero({ settings }: { settings: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP timeline with proper cleanup
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Just make elements visible if no motion
      gsap.set(".hh-word, .hh-lede, .hh-cta, .hh-panel, .hh-journey-card", { opacity: 1, y: 0, scale: 1 });
      if (document.querySelector(".hh-header-anim")) gsap.set(".hh-header-anim", { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Set initial state to avoid FOUC
      gsap.set(".hh-word, .hh-lede, .hh-cta, .hh-panel", { opacity: 0 });
      gsap.set(".hh-word", { y: 70 });
      gsap.set(".hh-lede", { y: 30 });
      gsap.set(".hh-cta", { y: 24 });
      gsap.set(".hh-panel", { y: 36, scale: 0.97 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(".hh-word", { y: 0, opacity: 1, duration: 1.1, stagger: 0.08 })
        .to(".hh-lede", { y: 0, opacity: 1, duration: 0.9 }, "-=0.7")
        .to(".hh-cta", { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .to(".hh-panel", { y: 0, opacity: 1, scale: 1, duration: 0.9 }, "-=0.7");

      // Removed parallax on missing .hh-hero-img
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="hh-hero relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-20 overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Animated card stream background — Twelve Labs style */}
      <HeroBackground />

      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-5">
        {/* Hero grid: copy + command panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-center min-h-[56vh] w-full">
          {/* Copy */}
          <div>
            <h1
              id="hero-title"
              className="flex flex-wrap gap-x-[0.15em] gap-y-[0.05em] m-0 mb-6"
              aria-label={settings.hero_headline}
            >
              {settings.hero_headline.split(" ").map((word: string, i: number) => {
                const isTeal = word.toLowerCase().includes("better");
                return (
                  <span
                    key={i}
                    className={cn("hh-word inline-block will-change-transform text-[clamp(60px,9.5vw,128px)] font-black leading-[0.88] tracking-tight text-white", isTeal && "text-[#04a891]")}
                  >
                    {word}
                  </span>
                );
              })}
            </h1>

            <p className="hh-lede max-w-[580px] text-white/70 text-[clamp(17px,2vw,21px)] leading-relaxed mb-8">
              {settings.hero_subheadline}
            </p>

            <div className="hh-cta flex flex-wrap gap-3">
              <Link
                href="/#staff"
                id="hero-cta-staff"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] bg-[#02695e] text-white text-[15px] font-semibold transition-all hover:bg-[#027d6f] hover:shadow-[0_14px_36px_rgba(2,105,94,0.42)] active:scale-[0.98]"
              >
                {settings.hero_cta_primary}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/#jobs"
                id="hero-cta-jobs"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] border border-white/14 bg-white/8 text-white text-[15px] font-semibold transition-all hover:bg-white/12 active:scale-[0.98]"
              >
                {settings.hero_cta_secondary}
              </Link>
            </div>
          </div>

          {/* Command panel */}
          <div
            className="hh-panel hidden lg:block rounded-[16px] border border-white/10 bg-gradient-to-br from-white/8 to-white/2 backdrop-blur-xl p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)]"
            aria-label="Workforce command panel"
          >
            <div className="flex items-center justify-between gap-3 text-xs text-white/60 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#04a891] shadow-[0_0_12px_#04a891]" />
                Workforce response desk
              </div>
              <span className="font-semibold text-white">Live</span>
            </div>

            <div className="mb-5">
              <p className="text-xs text-white/45 mb-1">Response standard</p>
              <p className="text-6xl font-black leading-none text-white">1<span className="text-3xl font-semibold text-white/60 ml-1">hour</span></p>
            </div>

            {/* Mini map */}
            <div
              className="relative min-h-[140px] mb-5 rounded-[10px] border border-white/8 overflow-hidden"
              style={{
                background: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                  radial-gradient(ellipse at 64% 46%, rgba(2,105,94,0.3), transparent 50%)
                `,
                backgroundSize: "22px 22px, 22px 22px, auto",
              }}
              aria-hidden="true"
            >
              {[
                { x: "22%", y: "48%" },
                { x: "61%", y: "42%" },
                { x: "72%", y: "64%" },
                { x: "83%", y: "74%" },
              ].map((pos, i) => (
                <motion.span
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full bg-[#04a891]"
                  style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(4,168,145,0.6)", "0 0 0 10px rgba(4,168,145,0)", "0 0 0 0 rgba(4,168,145,0)"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>

            <ul className="space-y-2.5">
              {[
                "Shortlist with care",
                "Quote within 24 hours",
                "Australia, New Zealand, Sri Lanka",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[13px] text-white/75">
                  <CheckCircle size={15} className="text-[#04a891] shrink-0" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
