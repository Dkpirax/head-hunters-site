"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const TIMELINE = [
  { year: "Early 1990s", event: "A practical recruitment business begins from home in Ivanhoe, Victoria." },
  { year: "First client", event: "Mail Management and urgent deadline support — the foundation of a service-first approach." },
  { year: "Expansion", event: "Labour hire, permanent recruitment and remote staffing teams across three markets." },
  { year: "Today", event: "A modern workforce partner with service standards, technology, and a clear human-first philosophy." },
];

export function Story({ settings }: { settings: any }) {
  return (
    <section id="story" className="bg-[#0B0B0C] py-28" aria-labelledby="story-title">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <motion.div
            className="relative rounded-[20px] overflow-hidden aspect-[4/3]"
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82"
              alt="Recruitment team in a planning session"
              fill
              className="object-cover saturate-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/60 to-transparent" />
            {/* Floating stat card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-[12px] bg-[#0B0B0C]/80 border border-white/10 backdrop-blur-xl">
              <p className="text-xs text-[#04a891] font-bold uppercase tracking-widest mb-1">Est. early 1990s</p>
              <p className="text-white font-semibold text-sm">From a home office in Ivanhoe to three workforce markets.</p>
            </div>
          </motion.div>

          {/* Copy */}
          <div>
            <motion.p className="eyebrow mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Our story
            </motion.p>
            <motion.h2
              id="story-title"
              className="text-[clamp(32px,4.5vw,58px)] font-black text-white leading-[0.95] tracking-tight mb-5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              {settings.story_title}
            </motion.h2>
            <motion.p className="text-white/55 text-[17px] leading-relaxed mb-10"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              {settings.story_text}
            </motion.p>

            {/* Timeline */}
            <div className="relative pl-5 border-l border-white/10 space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}>
                  <div className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-[#04a891]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#04a891] block mb-1">
                    {item.year}
                  </span>
                  <p className="text-white/70 text-sm leading-relaxed">{item.event}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
