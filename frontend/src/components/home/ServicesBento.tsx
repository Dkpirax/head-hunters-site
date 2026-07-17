"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import {
  Target, BriefcaseBusiness, Globe, RefreshCcw,
  Calculator, ShieldCheck, ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BentoCard } from "@/components/ui/BentoCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SERVICES: any[] = [
  {
    icon: Target,
    title: "Executive Search",
    description:
      "Confidential leadership and business-critical appointments handled with discretion, market understanding and disciplined judgement.",
    cta: { label: "Discuss a confidential search", href: "/#contact" },
    wide: true,
  },
  {
    icon: BriefcaseBusiness,
    title: "Permanent Placements",
    description:
      "Quality permanent hires for growth, replacement and capability building across core business functions.",
  },
  {
    icon: Globe,
    title: "Remote Staff Solutions",
    description:
      "Offshore support for admin, customer service, virtual assistance, digital marketing, bookkeeping and back office teams.",
    tags: ["Australia", "New Zealand", "Sri Lanka"],
    tall: true,
  },
  {
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Warehouse and logistics environment",
    title: "Casual Labour Hire",
    description: "Reliable casual staffing for urgent shifts, seasonal demand and operational deadlines.",
    wide: true,
  },
  {
    icon: RefreshCcw,
    title: "Casual to Permanent",
    description:
      "Start with flexible staffing, then convert proven workers into permanent roles when the fit is right.",
  },
  {
    icon: Calculator,
    title: "Payroll & Bookkeeping",
    description:
      "Practical offshore payroll, worker management and Xero or MYOB bookkeeping support.",
  },
  {
    icon: ShieldCheck,
    title: "Service Standards",
    description:
      "Fast communication, transparent process, daily back-end updates and 24/7 accessible support.",
    tags: ["1h response", "24h quote", "48h update"],
    wide: true,
    accent: true,
  },
  {
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Tech professional working",
  },
];

export function ServicesBento({ settings }: { settings: any }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".bento-item").forEach((card, i) => {
        gsap.fromTo(card,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            scrollTrigger: { trigger: card, start: "top 85%" },
            y: 0,
            opacity: 1,
            scale: 1,
            delay: Math.min(i * 0.04, 0.2),
            duration: 0.8,
            ease: "power4.out",
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="bg-[#0B0B0C] py-28 relative"
      aria-labelledby="services-title"
    >
      {/* Section heading */}
      <div className="max-w-[1200px] mx-auto px-5 text-center mb-14">
        <motion.p
          className="eyebrow mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Services
        </motion.p>
        <motion.h2
          id="services-title"
          className="text-[clamp(36px,5.5vw,68px)] font-black text-white leading-[0.94] tracking-tight mb-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {settings.services_tagline}
        </motion.h2>
        <motion.p
          className="text-white/55 text-lg max-w-[560px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          {settings.services_description}
        </motion.p>
      </div>

      {/* Bento grid */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-3.5 grid-flow-row-dense">
          {SERVICES.map((service, i) => {
            if (service.type === "image") {
              return (
                <BentoCard key={i} wide={service.wide} className="!p-0 min-h-[180px]">
                  <div className="relative h-full w-full overflow-hidden rounded-[14px]">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      className="object-cover saturate-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111413] via-[#111413]/40 to-transparent opacity-80" />
                    {(service.title || service.description) && (
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        {service.title && (
                          <h3 className="text-white font-bold text-2xl mb-3">
                            {service.title}
                          </h3>
                        )}
                        {service.description && (
                          <p className="text-white/70 text-sm leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </BentoCard>
              );
            }

            const Icon = service.icon!;
            return (
              <BentoCard key={i} wide={service.wide} tall={service.tall} accent={service.accent}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-[8px] bg-[#04a891]/15 border border-[#04a891]/20 grid place-items-center mb-4">
                    <Icon size={18} className="text-[#04a891]" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2.5">{service.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{service.description}</p>
                </div>
                <div className="relative">
                  {service.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {service.tags.map((tag: any) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-[6px] border border-white/10 text-white/60 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {service.cta && (
                    <a
                      href={service.cta.href}
                      className="inline-flex items-center gap-1.5 text-[#04a891] text-sm font-semibold hover:gap-3 transition-all duration-200"
                    >
                      {service.cta.label}
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
