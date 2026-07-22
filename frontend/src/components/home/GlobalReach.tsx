"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { Suspense, lazy } from 'react';

const CobeGlobe = lazy(() => import('./GlobeComponent').then(mod => ({ default: mod.GlobeComponent })));

const REGIONS = [
  { name: "Switzerland", desc: "Global headquarters and operations.", x: "46.8155", y: "8.2245" },
  { name: "Sri Lanka", desc: "Offshore admin, VA, bookkeeping and customer service teams.", x: "62%", y: "52%" },
];

export function GlobalReach({ settings }: { settings: any }) {
  return (
    <section className="bg-[#0B0B0C] py-28 relative overflow-hidden" aria-labelledby="global-title">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:60px_60px]"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div>
            <motion.p className="eyebrow mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Global reach
            </motion.p>
            <motion.h2
              id="global-title"
              className="text-[clamp(32px,8vw,62px)] font-black text-white leading-[1.05] tracking-tight mb-5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              {settings.global_reach_title}
            </motion.h2>
            <motion.p className="text-white/55 text-[17px] leading-relaxed mb-8"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              {settings.global_reach_text}
            </motion.p>

            <ul className="space-y-4">
              {REGIONS.map((r, i) => (
                <motion.li
                  key={r.name}
                  className="flex items-start gap-3 p-5 rounded-[12px] border border-white/5 bg-white/3 backdrop-blur-md hover:border-[#04a891]/40 hover:bg-white/5 transition-all duration-300 cursor-default"
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}>
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-[#04a891] shadow-[0_0_10px_#04a891] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm mb-0.5 truncate">{r.name}</p>
                    <p className="text-white/45 text-xs leading-relaxed break-words whitespace-normal">{r.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Interactive 3D Globe */}
          <motion.div
            className="relative flex items-center justify-center min-h-[400px]"
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* The globe creates its own gradient and glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,105,94,0.15)_0%,transparent_70%)] rounded-full blur-2xl pointer-events-none" />
            <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#04a891] border-t-transparent animate-spin"></div></div>}>
              <CobeGlobe />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


