"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  tall?: boolean;
  accent?: boolean;
}

export function BentoCard({ children, className, wide, tall, accent }: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "bento-item relative flex flex-col justify-between gap-4 p-6 rounded-[14px] overflow-hidden",
        "border border-white/8 transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-[#04a891]/50",
        "will-change-transform",
        "[--mx:30%] [--my:20%]",
        // pointer glow via CSS variable
        "before:absolute before:inset-0 before:rounded-[14px] before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        "before:[background:radial-gradient(circle_at_var(--mx)_var(--my),rgba(4,168,145,0.18),transparent_50%)]",
        accent
          ? "bg-gradient-to-br from-[#02695e]/40 via-[#02695e]/15 to-white/3"
          : "bg-gradient-to-br from-white/7 to-white/2",
        wide && "col-span-2",
        tall && "row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
