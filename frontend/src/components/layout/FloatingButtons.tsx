"use client";

import { useEffect, useState } from "react";
import { ArrowUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { useLocation } from "react-router-dom";
import { playSound } from "@/lib/sounds";

export function FloatingButtons({ chatbotEnabled = true }: { chatbotEnabled?: boolean }) {
  const location = useLocation();
  const isAdmin = location.pathname?.startsWith("/admin");
  const [showScroll, setShowScroll] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check for unread state initially
  useEffect(() => {
    const lastRead = localStorage.getItem("hh_chat_read_timestamp");
    if (!lastRead) {
      const timer = setTimeout(() => setHasUnread(true), 0); // Defer to avoid synchronous setState warning
      return () => clearTimeout(timer);
    }
  }, []);


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleChat = () => {
    if (!isChatOpen) {
      playSound("open");
      setHasUnread(false);
      localStorage.setItem("hh_chat_read_timestamp", Date.now().toString());
    } else {
      playSound("close");
    }
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatOpen]);

  if (isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {chatbotEnabled && isChatOpen && (
          <Chatbot onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={scrollToTop}
            className={`w-12 h-12 rounded-full bg-[#0B0B0C]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg hover:bg-[#02695e] hover:border-[#02695e] transition-colors cursor-pointer ${isChatOpen ? 'hidden md:flex' : ''}`}
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {chatbotEnabled && (
        <div className={`relative ${isChatOpen ? 'hidden sm:block' : ''}`}>
          <button
            onClick={handleToggleChat}
            className={`group text-white shadow-[0_8px_30px_rgba(4,168,145,0.45)] hover:shadow-[0_8px_40px_rgba(4,168,145,0.65)] hover:scale-105 transition-all cursor-pointer z-50 relative flex items-center justify-center bg-gradient-to-r from-[#02695e] to-[#04a891] ${
              isChatOpen 
                ? "w-14 h-14 rounded-full" 
                : "h-14 pl-3 pr-5 rounded-full gap-2.5"
            }`}
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
            title={isChatOpen ? "Close chat" : "Open chat"}
          >
            {isChatOpen ? (
              <X size={22} className="text-white" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <img src="/logo/favicon-mark.png" alt="HH" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-[13px] font-bold tracking-wide whitespace-nowrap">
                  Chat with us
                </span>
              </>
            )}
          </button>
          {hasUnread && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-black animate-pulse shadow-md">1</span>
          )}
        </div>
      )}
    </div>
  );
}



