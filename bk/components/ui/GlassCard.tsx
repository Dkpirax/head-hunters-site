"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  href?: string;
  glowColor?: string;
}

export function GlassCard({
  children,
  className,
  as: Tag = "div",
  glowColor = "rgba(2, 105, 94, 0.22)",
  ...props
}: GlassCardProps & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--glow-x", `${x}%`);
      el.style.setProperty("--glow-y", `${y}%`);
    },
    []
  );

  return (
    <Tag
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        "relative overflow-hidden rounded-[16px]",
        "border border-white/10",
        "bg-gradient-to-br from-white/8 to-white/3",
        "backdrop-blur-xl",
        "shadow-[0_24px_80px_rgba(0,0,0,0.32)]",
        "transition-all duration-300 ease-out",
        "before:absolute before:inset-0 before:rounded-[16px] before:opacity-0 before:transition-opacity before:duration-300",
        "hover:border-[#02695e]/50 hover:before:opacity-100",
        "[--glow-x:50%] [--glow-y:50%]",
        "before:[background:radial-gradient(circle_at_var(--glow-x)_var(--glow-y),var(--glow-color,rgba(2,105,94,0.18)),transparent_60%)]",
        className
      )}
      style={{ "--glow-color": glowColor } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  );
}
