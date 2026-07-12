"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/chatbot/Chatbot").then(mod => mod.Chatbot), { ssr: false });
import { usePathname } from "next/navigation";

export function FloatingButtons({ chatbotEnabled = true }: { chatbotEnabled?: boolean }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
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

  if (isAdmin) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setHasUnread(false);
      localStorage.setItem("hh_chat_read_timestamp", Date.now().toString());
    }
  };

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
            className="w-12 h-12 rounded-full bg-[#0B0B0C]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg hover:bg-[#02695e] hover:border-[#02695e] transition-colors cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {chatbotEnabled && (
        <button
          onClick={handleToggleChat}
          className="w-14 h-14 rounded-full bg-[#04a891] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(4,168,145,0.4)] hover:scale-105 hover:bg-[#039682] transition-all cursor-pointer z-50 relative"
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          {isChatOpen ? <X size={22} /> : <MessageSquare size={22} />}
          {hasUnread && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#02695e] border border-white flex items-center justify-center text-[10px] text-white font-black animate-pulse shadow-md">
              1
            </span>
          )}
        </button>
      )}
    </div>
  );
}


