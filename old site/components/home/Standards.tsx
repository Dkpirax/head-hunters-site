"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Users, Headphones } from "lucide-react";

const STANDARDS = [
  { value: "1h", label: "Sales consultant response", icon: Clock, description: "Every employer enquiry is treated as a live operational moment." },
  { value: "24h", label: "Quote target", icon: FileText, description: "Clear brief in, structured quote out — fast." },
  { value: "48h", label: "Worker update target", icon: Users, description: "Candidates and clients kept in the loop, always." },
  { value: "24/7", label: "Accessible support", icon: Headphones, description: "WhatsApp, email and phone — not just office hours." },
];

export function Standards() {
  return (
    <section id="standards" className="bg-[#f2f3ef] py-28" aria-labelledby="standards-title">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
          <div>
            <motion.p className="eyebrow-dark eyebrow mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Service promise
            </motion.p>
            <motion.h2
              id="standards-title"
              className="text-[clamp(34px,5vw,64px)] font-black text-[#111413] leading-[0.95] tracking-tight mb-5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              Built to make hiring feel controlled.
            </motion.h2>
            <motion.p className="text-[#111413]/60 text-[17px] leading-relaxed"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              Every enquiry is treated as a live operational moment, not a generic form submission. Speed and trust are part of the product.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STANDARDS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.value}
                  className="bg-white rounded-[14px] border border-black/6 p-6 flex flex-col justify-between gap-4 hover:border-[#02695e]/30 hover:shadow-[0_8px_32px_rgba(2,105,94,0.08)] transition-all duration-300"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <div>
                    <Icon size={18} className="text-[#02695e] mb-3" strokeWidth={1.8} />
                    <strong className="block text-[clamp(32px,5vw,52px)] font-black text-[#02695e] leading-none mb-1">
                      {s.value}
                    </strong>
                    <p className="text-[13px] font-semibold text-[#111413]/70">{s.label}</p>
                  </div>
                  <p className="text-[13px] text-[#111413]/50 leading-relaxed">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
