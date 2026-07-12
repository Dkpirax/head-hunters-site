"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── Recruitment card content pool ───────────────────────────────────────────
const CARD_POOL = [
  { title: "Executive Search",      sub: "Melbourne, VIC",   badge: "Confidential",  hot: false },
  { title: "Warehouse Team Lead",   sub: "Sydney, NSW",      badge: "Casual · Now",  hot: true  },
  { title: "Virtual Assistant",     sub: "Remote · LK",      badge: "Full-time",     hot: false },
  { title: "Operations Director",   sub: "Auckland, NZ",     badge: "Permanent",     hot: false },
  { title: "Bookkeeper (Xero)",     sub: "Remote · AU",      badge: "Part-time",     hot: false },
  { title: "Customer Service Lead", sub: "Brisbane, QLD",    badge: "Permanent",     hot: false },
  { title: "Labour Hire Team",      sub: "Melbourne, VIC",   badge: "🔥 Urgent",     hot: true  },
  { title: "Digital Marketing",     sub: "Remote · SRI",     badge: "Full-time",     hot: false },
  { title: "Payroll Officer",       sub: "Auckland, NZ",     badge: "Permanent",     hot: false },
  { title: "Admin Support VA",      sub: "Colombo, LK",      badge: "Remote",        hot: false },
  { title: "Logistics Coordinator", sub: "Perth, WA",        badge: "Permanent",     hot: false },
  { title: "HR Business Partner",   sub: "Melbourne, VIC",   badge: "Executive",     hot: false },
  { title: "Container Unloader",    sub: "Port Melbourne",   badge: "🔥 Red Hot",    hot: true  },
  { title: "Finance Director",      sub: "Auckland, NZ",     badge: "Executive",     hot: false },
  { title: "Remote Staff Mgr",      sub: "SRI · AU Clients", badge: "Full-time",     hot: false },
  { title: "Casual → Permanent",    sub: "Sydney, NSW",      badge: "Converting",    hot: false },
  { title: "Site Supervisor",       sub: "Melbourne, VIC",   badge: "Casual · Now",  hot: true  },
  { title: "Customer Support",      sub: "Colombo, LK",      badge: "Remote",        hot: false },
  { title: "Accounts Payable",      sub: "Auckland, NZ",     badge: "Permanent",     hot: false },
  { title: "Workforce Solutions",   sub: "Australia-wide",   badge: "1h Response",   hot: false },
];

// ─── Build diagonal streaming grid ───────────────────────────────────────────
// 6 streams × 7 depth levels
// Each stream is a diagonal line of cards streaming from far-left (tiny/faint) to near-right (large/clear)
const STREAMS = 6;
const DEPTH = 7;

interface CardItem {
  id: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blur: number;
  depthRatio: number;
  content: (typeof CARD_POOL)[number];
}

function buildCards(): CardItem[] {
  const cards: CardItem[] = [];
  for (let s = 0; s < STREAMS; s++) {
    for (let d = 0; d < DEPTH; d++) {
      const t = d / (DEPTH - 1); // 0=far, 1=near
      cards.push({
        id: `${s}-${d}`,
        x: d * 210 - 60,
        // Shift up further: fill behind the command panel area
        y: s * 140 - 360 + d * 44,
        scale: 0.28 + t * 0.72,
        opacity: 0.06 + t * 0.94,
        blur: (1 - t) * 3.5,
        depthRatio: t,
        content: CARD_POOL[(s * DEPTH + d) % CARD_POOL.length],
      });
    }
  }
  return cards;
}

const ALL_CARDS = buildCards();

// ─── Single card ─────────────────────────────────────────────────────────────
function StreamCard({
  card,
  mouseX,
  mouseY,
}: {
  card: CardItem;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  // Far cards move MORE (they "lag behind"), near cards barely move
  const parallaxStrength = (1 - card.depthRatio) * 32;
  const px = useTransform(mouseX, (v) => -v * parallaxStrength);
  const py = useTransform(mouseY, (v) => -v * parallaxStrength * 0.6);
  const { content } = card;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: card.x,
        top: card.y,
        scale: card.scale,
        opacity: card.opacity,
        filter: card.blur > 0 ? `blur(${card.blur}px)` : undefined,
        x: px,
        y: py,
        transformOrigin: "top left",
      }}
    >
      <div
        style={{
          width: 196,
          borderRadius: 10,
          overflow: "hidden",
          background: content.hot
            ? "linear-gradient(135deg, rgba(2,105,94,0.55) 0%, rgba(11,11,12,0.88) 60%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(11,11,12,0.84) 65%)",
          border: content.hot
            ? "1px solid rgba(4,168,145,0.50)"
            : "1px solid rgba(255,255,255,0.11)",
          boxShadow: content.hot
            ? "0 8px 28px rgba(2,105,94,0.28), inset 0 0 0 1px rgba(4,168,145,0.10)"
            : "0 4px 16px rgba(0,0,0,0.35)",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 3,
            background: content.hot
              ? "linear-gradient(90deg, #04a891, #02695e)"
              : "linear-gradient(90deg, rgba(2,105,94,0.55), transparent)",
          }}
        />

        {/* Body */}
        <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Badge pill */}
          <span
            style={{
              display: "inline-block",
              alignSelf: "flex-start",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 6px",
              borderRadius: 4,
              background: content.hot ? "rgba(4,168,145,0.22)" : "rgba(255,255,255,0.07)",
              border: `1px solid ${content.hot ? "rgba(4,168,145,0.35)" : "rgba(255,255,255,0.09)"}`,
              color: content.hot ? "#04a891" : "rgba(255,255,255,0.45)",
            }}
          >
            {content.badge}
          </span>

          {/* Title */}
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.3,
              color: content.hot ? "#fff" : "rgba(255,255,255,0.88)",
            }}
          >
            {content.title}
          </p>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                flexShrink: 0,
                background: content.hot ? "#04a891" : "rgba(4,168,145,0.55)",
                boxShadow: content.hot ? "0 0 6px #04a891" : undefined,
              }}
            />
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
              {content.sub}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function HeroBackground() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Raw normalised mouse position (-1 … 1)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Springy follow
  const mouseX = useSpring(rawX, { damping: 35, stiffness: 100, mass: 0.8 });
  const mouseY = useSpring(rawY, { damping: 35, stiffness: 100, mass: 0.8 });

  // Whole-container subtle tilt driven by mouse
  const rotateY = useTransform(mouseX, [-1, 1], [-5, 5]);
  const rotateX = useTransform(mouseY, [-1, 1], [3, -3]);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const el = heroRef.current?.closest(".hh-hero") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left - r.width / 2) / (r.width / 2));
      rawY.set((e.clientY - r.top - r.height / 2) / (r.height / 2));
    },
    [rawX, rawY]
  );

  const handleLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  useEffect(() => {
    const hero = heroRef.current?.closest(".hh-hero") as HTMLElement | null;
    if (!hero) return;
    hero.addEventListener("mousemove", handleMove);
    hero.addEventListener("mouseleave", handleLeave);
    return () => {
      hero.removeEventListener("mousemove", handleMove);
      hero.removeEventListener("mouseleave", handleLeave);
    };
  }, [handleMove, handleLeave]);

  return (
    <div
      ref={heroRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    >
      {/* ── Perspective tilt wrapper ── */}
      <motion.div
        style={{
          position: "absolute",
          // Position card canvas on the RIGHT 65% of the hero
          left: "25%",
          top: 0,
          right: 0,
          bottom: 0,
          perspective: 1000,
          perspectiveOrigin: "20% 50%",
          rotateY,
          rotateX,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card canvas — positioned relative to the perspective container */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-38%)",
          }}
        >
          {ALL_CARDS.map((card) => (
            <StreamCard
              key={card.id}
              card={card}
              mouseX={mouseX}
              mouseY={mouseY}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Gradient masks ── */}
      {/* Left mask — protect left copy area but let cards breathe on the right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, #0B0B0C 0%, #0B0B0C 26%, rgba(11,11,12,0.80) 40%, rgba(11,11,12,0.18) 56%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom mask */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: 200,
          background: "linear-gradient(to top, #0B0B0C 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Top mask */}
      <div
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 120,
          background: "linear-gradient(to bottom, #0B0B0C 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Brand glow ── */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: "15%",
          width: 500,
          height: 350,
          background:
            "radial-gradient(ellipse, rgba(2,105,94,0.14) 0%, transparent 70%)",
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
