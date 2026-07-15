"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PROMPTS = [
  { label: "Looking for a container unloader?", toast: "Casual labour selected — add shift count, site and start time below." },
  { label: "Need warehouse staff urgently?", toast: "Urgent warehouse selected — specify shift pattern and licences required." },
  { label: "Need admin or remote staff support?", toast: "Remote admin selected — choose VA, customer service or bookkeeping." },
];

export function EmployerSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="employer-flow" className="bg-[#111413] py-28 border-t border-white/6" aria-labelledby="employer-title">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Copy */}
          <div>
            <motion.p className="eyebrow mb-4"
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>For employers</motion.p>
            <motion.h2
              id="employer-title"
              className="text-[clamp(32px,5vw,60px)] font-black text-white leading-[0.95] tracking-tight mb-5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              Request staff without the old recruitment friction.
            </motion.h2>
            <motion.p className="text-white/55 text-[17px] leading-relaxed mb-8"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              Choose the worker type, urgency and location. Your brief turns into a consultant-ready enquiry — fast and direct.
            </motion.p>

            <motion.div className="space-y-2.5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
              {PROMPTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSelected(p.toast)}
                  className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-[12px] border text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                    selected === p.toast
                      ? "border-[#04a891]/60 bg-[#04a891]/8 text-white"
                      : "border-white/8 bg-white/4 text-white/70 hover:border-white/16 hover:text-white"
                  }`}
                >
                  {p.label}
                  {selected === p.toast
                    ? <CheckCircle size={16} className="text-[#04a891] shrink-0" />
                    : <ArrowRight size={15} className="text-white/30 shrink-0" />
                  }
                </button>
              ))}
            </motion.div>

            {selected && (
              <motion.div
                className="mt-4 p-4 rounded-[10px] border border-[#04a891]/30 bg-[#04a891]/8 text-sm text-white/75"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}>
                ✓ {selected}
              </motion.div>
            )}
          </div>

          {/* Form */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-gradient-to-br from-white/6 to-transparent backdrop-blur-xl p-8"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: "easeOut" }}>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#02695e]/20 border border-[#04a891]/30 grid place-items-center">
                  <CheckCircle size={28} className="text-[#04a891]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">Brief received</h3>
                  <p className="text-white/50 text-sm">A consultant will respond within 1 hour.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4" aria-label="Employer hiring brief form">
                <h3 className="text-white font-bold text-lg mb-5">Share your hiring brief</h3>
                {[
                  { id: "emp-name", label: "Your name", type: "text", placeholder: "Full name", required: true },
                  { id: "emp-email", label: "Work email", type: "email", placeholder: "you@company.com", required: true },
                ].map((f) => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">{f.label}</label>
                    <input id={f.id} type={f.type} placeholder={f.placeholder} required={f.required}
                      className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all" />
                  </div>
                ))}
                <div>
                  <label htmlFor="emp-service" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Service need</label>
                  <select id="emp-service" className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-[#111413] text-white text-sm focus:border-[#04a891]/60 outline-none transition-all cursor-pointer">
                    <option>Casual labour hire</option>
                    <option>Permanent placement</option>
                    <option>Remote staff solution</option>
                    <option>Executive search</option>
                    <option>Payroll support</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="emp-brief" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Brief</label>
                  <textarea id="emp-brief" placeholder="Role, headcount, must-have requirements and start date..." required rows={3}
                    className="w-full px-4 py-3 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all resize-none" />
                </div>
                <Button type="submit" variant="solid" size="lg" className="w-full justify-center gap-2">
                  Share hiring brief <Send size={14} />
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
