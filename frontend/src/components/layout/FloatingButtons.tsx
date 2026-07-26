"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

// The chatbot prop is kept for forward-compatibility but the chat UI
// is excluded entirely from this build (VITE_ENABLE_AI_CHAT=false).
export function FloatingButtons({ chatbotEnabled = false }: { chatbotEnabled?: boolean }) {
  const location = useLocation();
  const isAdmin = location.pathname?.startsWith("/admin");
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

  if (isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[102] flex flex-col items-end gap-3">
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
    </div>
  );
}
