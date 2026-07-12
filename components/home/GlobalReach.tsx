"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const REGIONS = [
  { name: "Australia", desc: "Permanent, casual, executive and remote staffing solutions.", x: "78%", y: "72%" },
  { name: "New Zealand", desc: "Workforce support aligned to NZ employment conditions.", x: "85%", y: "80%" },
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

      <div className="max-w-[1200px] mx-auto px-5 relative">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          <div>
            <motion.p className="eyebrow mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Global reach
            </motion.p>
            <motion.h2
              id="global-title"
              className="text-[clamp(34px,5vw,62px)] font-black text-white leading-[0.95] tracking-tight mb-5"
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
                  <div>
                    <p className="text-white font-semibold text-sm mb-0.5">{r.name}</p>
                    <p className="text-white/45 text-xs leading-relaxed">{r.desc}</p>
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
            <CobeGlobe />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

function CobeGlobe() {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const [landPolygons, setLandPolygons] = useState([]);

  useEffect(() => {
    // Fetch local GeoJSON to safely custom-color the continents without network blocks
    fetch('/world.json')
      .then(res => res.json())
      .then(data => setLandPolygons(data.features))
      .catch(err => console.error("Error loading local world data:", err));

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].target) {
        setDimensions({
          width: entries[0].target.clientWidth,
          height: entries[0].target.clientHeight || entries[0].target.clientWidth
        });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enableZoom = false;
      globeEl.current.pointOfView({ altitude: 1.3, lat: -15, lng: 115 });
      
      // Safely attempt to set the globe's ocean base color directly on the material
      if (typeof globeEl.current.globeMaterial === 'function') {
        const material = globeEl.current.globeMaterial();
        if (material && material.color) {
          material.color.set("#030706");
        }
      }
    }

    let currentScroll = window.scrollY;
    const onScroll = () => {
      if (globeEl.current) {
        const dy = window.scrollY - currentScroll;
        const currentPov = globeEl.current.pointOfView();
        globeEl.current.pointOfView({ ...currentPov, lng: currentPov.lng + dy * 0.15 });
        currentScroll = window.scrollY;
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const markers = [
    { lat: -25.2744, lng: 133.7751, label: "Australia" },
    { lat: -40.9006, lng: 174.8860, label: "New Zealand" },
    { lat: 7.8731, lng: 80.7718, label: "Sri Lanka" }
  ];

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing scale-110 md:scale-125 transform-origin-center mt-10 md:mt-0">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        
        // 1. The Ocean Base (Very dark, almost black)
        showGlobe={true}
        
        // 2. The Continents (Deep greenish tint matching the reference)
        polygonsData={landPolygons}
        polygonCapColor={() => "#0A211D"} 
        polygonSideColor={() => "rgba(10, 33, 29, 0.5)"}
        polygonStrokeColor={() => "#0E312B"} 
        
        // Atmosphere tweaking for that outer green glow
        showAtmosphere={true}
        atmosphereColor="#04a891"
        atmosphereAltitude={0.15}
        
        // Faint coordinate grid lines over the ocean
        showGraticules={true}

        htmlElementsData={markers}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; transform: translate(-15px, -15px); pointer-events: none;">
              
              <!-- Glowing Outer Node -->
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="width: 12px; height: 12px; background: #04a891; border-radius: 50%; z-index: 2; box-shadow: 0 0 12px #04a891;"></div>
                <div style="position: absolute; width: 28px; height: 28px; background: rgba(4, 168, 145, 0.25); border-radius: 50%; filter: blur(3px); z-index: 1;"></div>
              </div>
              
              <!-- Glassmorphic Pill Label -->
              <div style="background: rgba(11, 11, 12, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08); padding: 6px 14px; border-radius: 8px; color: #F4F4F5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.5); letter-spacing: -0.01em;">
                ${d.label}
              </div>
              
            </div>
          `;
          return el;
        }}
      />
    </div>
  );
}
