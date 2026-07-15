"use client";

import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export function SignOutLink() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all cursor-pointer text-left border-none outline-none bg-transparent"
      >
        <LogOut size={15} strokeWidth={1.8} /> Sign out
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[400px] bg-[#111413] border border-white/10 rounded-[20px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] text-center relative"
            >
              <button
                onClick={() => setShowConfirm(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                <LogOut size={20} strokeWidth={1.8} />
              </div>

              <h3 className="text-white font-bold text-base mb-2">Confirm Sign Out</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-6">
                Are you sure you want to sign out of the Head Hunters Admin Portal?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-10 rounded-[8px] border border-white/10 bg-white/5 text-white/70 text-xs font-bold hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 h-10 rounded-[8px] bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
