"use client";

import { useRef, useEffect } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

const STATS = [
  { value: 30, suffix: "+", label: "Years of recruitment history" },
  { value: 3, suffix: "", label: "Country workforce footprint" },
  { value: 1, suffix: "h", label: "Response standard" },
  { value: 24, suffix: "h", label: "Quote target" },
  { value: 48, suffix: "h", label: "Worker update target" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [inView, count, target]);

  return (
    <span ref={ref} className="inline-block tabular-nums">
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.span>{rounded}</motion.span>
      </motion.span>
    </span>
  );
}

export function ProofStrip() {
  return (
    <section className="bg-[#f2f3ef] border-y border-black/6 py-10" aria-label="Trust signals">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-1.5 p-5 rounded-[12px] bg-white border border-black/6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
            >
              <strong className="text-[clamp(28px,4vw,44px)] font-black text-[#111413] leading-none">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </strong>
              <span className="text-[13px] text-[#111413]/55 leading-snug">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
