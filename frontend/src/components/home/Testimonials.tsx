"use client";

import { motion } from "framer-motion";

import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "The process gave our hiring team clarity quickly. The shortlist felt considered, not recycled.",
    role: "Operations Director",
    segment: "White collar",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    quote: "When we needed labour urgently, the response was practical, direct and fast. Exactly what we needed.",
    role: "Logistics Manager",
    segment: "Blue collar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
  },
  {
    quote: "The conversation was respectful and useful. I knew what to expect before each step of the process.",
    role: "Job seeker",
    segment: "Candidate",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80",
  },
];

export function Testimonials({ settings }: { settings: any }) {
  return (
    <section className="bg-[#f2f3ef] py-28" aria-labelledby="testimonials-title">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center mb-14">
          <motion.p className="eyebrow-dark eyebrow mb-4"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}>
            Proof
          </motion.p>
          <motion.h2
            id="testimonials-title"
            className="text-[clamp(32px,4.5vw,58px)] font-black text-[#111413] leading-[0.95] tracking-tight"
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            {settings.testimonials_title}
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={i}
              className="bg-white rounded-[16px] border border-black/6 p-7 flex flex-col justify-between gap-6 hover:border-[#02695e]/20 hover:shadow-[0_12px_40px_rgba(2,105,94,0.06)] transition-all duration-300"
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}>
              <div>
                <Quote size={22} className="text-[#02695e] mb-5 opacity-60" strokeWidth={1.5} />
                <p className="text-[#111413]/80 text-[17px] leading-relaxed font-medium italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <footer className="flex items-center gap-3 pt-4 border-t border-black/6">
                <img
                  src={t.avatar}
                  alt={t.role}
                  width={40}
                  height={40}
                  className="rounded-full object-cover grayscale shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-[#111413]">{t.role}</p>
                  <p className="text-xs text-[#02695e] font-medium">{t.segment}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        {/* Rating */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-6 px-4 rounded-[14px] border border-black/6 bg-white text-center sm:text-left"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div>
            <div className="text-2xl font-black text-[#02695e]">★★★★★</div>
            <p className="text-sm font-semibold text-[#111413] mt-1">4.9 Google Rating</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-black/10" />
          <p className="text-sm text-[#111413]/55 max-w-[280px] leading-relaxed">
            Verified employer and candidate reviews. Live Google Reviews integration in Phase 2.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
