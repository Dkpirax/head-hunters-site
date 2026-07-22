"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

export function GlobeComponent() {
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
    { lat: 46.8155, lng: 8.2245, label: "Switzerland" },
    { lat: 7.8731, lng: 80.7718, label: "Sri Lanka" }
  ];

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden pointer-events-none md:pointer-events-auto md:cursor-grab md:active:cursor-grabbing scale-90 md:scale-100 transform-origin-center mt-10 md:mt-0">
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
