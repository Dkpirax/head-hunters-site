"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Target, BriefcaseBusiness, Users, ShieldCheck, UserPlus,
  Lightbulb, LineChart, Calculator, RefreshCcw, ArrowRight, ExternalLink
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BentoCard } from "@/components/ui/BentoCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const RECRUITMENT_SERVICES = [
  {
    title: "Executive Search",
    description: "Find and attract senior leaders who drive long-term business value.",
    icon: Target,
  },
  {
    title: "Permanent Recruitment",
    description: "Source qualified professionals for long-term roles across all industries.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Mass Recruitment",
    description: "Scale your workforce quickly with high-volume hiring solutions.",
    icon: Users,
  },
  {
    title: "Confidential Hiring",
    description: "Discreet candidate sourcing for sensitive and business-critical roles.",
    icon: ShieldCheck,
  },
  {
    title: "Talent Acquisition",
    description: "End-to-end support for sourcing, screening, and placing top candidates.",
    icon: UserPlus,
  },
  {
    title: "HR Consulting",
    description: "Practical guidance to improve workforce performance and HR processes.",
    icon: Lightbulb,
  },
  {
    title: "Workforce Planning",
    description: "Map talent needs and skill gaps to align with your business strategy.",
    icon: LineChart,
  },
  {
    title: "Salary Benchmarking",
    description: "Real-world insights to build competitive compensation packages.",
    icon: Calculator,
  },
  {
    title: "Recruitment Process Outsourcing",
    description: "Let our specialists manage your hiring as an extension of your team.",
    icon: RefreshCcw,
  },
];

const DIGITAL_CHERRY_URL = "https://digitalcherry.lk/";
const DIGITAL_CHERRY_SERVICES = [
  "Social Media Management", "Search Engine Optimization",
  "Google Ads & PPC Campaigns", "Meta Advertising",
  "LinkedIn Marketing", "Content Creation",
  "Email Marketing", "Lead Generation",
  "Website Design & Development", "Website Maintenance",
  "Marketing Analytics & Reporting"
];

const FENRA_URL = "https://thefenra.com";
const FENRA_SERVICES = [
  "Branding Solutions", "Brand Strategy",
  "Logo Design", "Corporate Identity",
  "Company Profiles", "Business Stationery",
  "Marketing Collateral", "Packaging Design",
  "Employer Branding", "Presentation Design",
  "SaaS Solutions"
];

export function ServicesBento({ settings }: { settings?: any }) {
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
      id="solutions"
      className="bg-[#0B0B0C] py-28 relative"
      aria-labelledby="solutions-title"
    >
      {/* Section 1: Our Solutions (Recruitment & HR) */}
      <div className="max-w-[1200px] mx-auto px-5 mb-20">
        <div className="text-center mb-14">
          <motion.p
            className="eyebrow mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            OUR SOLUTIONS
          </motion.p>
          <motion.h2
            id="solutions-title"
            className="text-[clamp(36px,5.5vw,68px)] font-black text-white leading-[0.94] tracking-tight mb-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            Integrated Business Solutions for Sustainable Growth
          </motion.h2>
          <motion.div
            className="text-white/60 text-lg max-w-[800px] mx-auto space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <p>
              Successful businesses need more than great talent. They require a strong brand, an effective digital presence, and innovative technology to stay ahead.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/logo/logo-white.png" alt="Headhunters" className="h-8 object-contain mb-4 opacity-90" />
          <h3 className="text-3xl font-bold text-white mb-3">Recruitment & HR Solutions</h3>
          <p className="text-white/70 max-w-[700px]">
            We recruit exceptional talent across all levels. Our solutions reduce hiring risks, shorten recruitment cycles, and build high-performing teams that drive success.
          </p>
        </div>

        {/* Recruitment Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {RECRUITMENT_SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <BentoCard key={i}>
                <div className="relative h-full flex flex-col">
                  <div className="w-10 h-10 rounded-[8px] bg-[#04a891]/15 border border-[#04a891]/20 grid place-items-center mb-4">
                    <Icon size={18} className="text-[#04a891]" strokeWidth={1.8} />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-2.5">{service.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{service.description}</p>
                </div>
              </BentoCard>
            );
          })}
        </div>
        
        <div className="text-center flex justify-center">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-white bg-[#04a891] hover:bg-[#038b78] px-6 py-3 rounded-full font-semibold transition-colors duration-200 shadow-[0_4px_14px_0_rgba(4,168,145,0.39)]"
          >
            Discuss Your Recruitment Requirements <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Section 2: Outsourced Solutions */}
      <div className="max-w-[1200px] mx-auto px-5 pt-16 border-t border-white/5">
        <div className="text-center mb-12">
          <motion.p
            className="eyebrow mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            OUTSOURCED SOLUTIONS
          </motion.p>
          <motion.h2
            className="text-[clamp(28px,4vw,48px)] font-black text-white leading-tight mb-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            Specialized Expertise Through Our Business Divisions
          </motion.h2>
          <motion.p
            className="text-white/60 text-lg max-w-[600px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            Access professional digital marketing, branding, creative, and technology services through our specialized business divisions.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Digital Cherry */}
          <BentoCard className="flex flex-col h-full bg-gradient-to-br from-[#12161b] to-[#0a0c0f] border-white/5">
            <div className="mb-6 flex items-center justify-between">
              <a href={DIGITAL_CHERRY_URL} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-block transition-transform hover:scale-105">
                <span className="text-xl font-bold text-white tracking-wide">Digital Marketing Solutions</span>
              </a>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#04a891] bg-[#04a891]/10 px-3 py-1 rounded-full">
                Digital Marketing Solutions
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">
              Driving Business Growth Through Digital Innovation
            </h3>
            
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Our Digital Marketing Solutions team helps businesses increase visibility, generate quality leads, and build meaningful customer relationships through practical, data-driven strategies.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
              {DIGITAL_CHERRY_SERVICES.map((service, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-[8px] bg-white/5 border border-white/5 text-white/70 text-xs font-medium">
                  {service}
                </span>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <a
                href={DIGITAL_CHERRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-2 text-white hover:text-[#04a891] text-sm font-semibold transition-colors duration-200"
              >
                Visit Digital Marketing Solutions <ExternalLink size={14} />
              </a>
            </div>
          </BentoCard>

          {/* Card 2: Fenra */}
          <BentoCard className="flex flex-col h-full bg-gradient-to-br from-[#12161b] to-[#0a0c0f] border-white/5">
            <div className="mb-6 flex items-center justify-between">
              <a href={FENRA_URL} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-block transition-transform hover:scale-105">
                <img src="/logo/Fenra_logo.png" alt="Fenra" className="h-14 object-contain" />
              </a>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#04a891] bg-[#04a891]/10 px-3 py-1 rounded-full">
                Branding & Technology Solutions
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">
              Creating Brands That Inspire Confidence
            </h3>
            
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Build memorable brands and digital experiences with scalable technology.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
              {FENRA_SERVICES.map((service, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-[8px] bg-white/5 border border-white/5 text-white/70 text-xs font-medium">
                  {service}
                </span>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <a
                href={FENRA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-2 text-white hover:text-[#04a891] text-sm font-semibold transition-colors duration-200"
              >
                Explore Fenra Solutions <ExternalLink size={14} />
              </a>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
