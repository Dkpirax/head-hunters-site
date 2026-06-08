"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingButtons() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-[#0B0B0C]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg hover:bg-[#02695e] hover:border-[#02695e] transition-colors cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      
      <button
        className="w-14 h-14 rounded-full bg-[#04a891] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(4,168,145,0.4)] hover:scale-105 hover:bg-[#039682] transition-all cursor-pointer"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
