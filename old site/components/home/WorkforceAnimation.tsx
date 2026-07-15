"use client";

import { motion } from "framer-motion";
import { Users, Building, Briefcase, ChevronRight } from "lucide-react";

export function WorkforceAnimation() {
  return (
    <div className="mt-12 relative h-[220px] w-full rounded-[16px] bg-white border border-black/5 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(#02695e_1px,transparent_1px),linear-gradient(90deg,#02695e_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      
      <div className="absolute inset-0 flex items-center justify-between px-10 md:px-16">
        {/* Left Node */}
        <motion.div 
          className="relative z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-14 h-14 rounded-full bg-[#f2f3ef] border border-black/10 flex items-center justify-center shadow-sm relative">
            <Building className="text-[#111413] w-6 h-6" />
            <motion.div 
              className="absolute -right-1 -top-1 w-4 h-4 bg-[#04a891] rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#111413]/60 uppercase tracking-wider">Business</span>
        </motion.div>

        {/* Center Process */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Animated connection line */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#04a891]/30 to-transparent" />
          
          <motion.div 
            className="absolute left-0 w-1/2 h-[2px] bg-gradient-to-r from-transparent to-[#04a891]"
            animate={{ left: ["-50%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          />

          <motion.div 
            className="relative z-10 w-16 h-16 rounded-[14px] bg-[#02695e] shadow-[0_8px_24px_rgba(2,105,94,0.3)] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Briefcase className="text-white w-7 h-7" />
          </motion.div>
        </div>

        {/* Right Node */}
        <motion.div 
          className="relative z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="w-14 h-14 rounded-full bg-[#f2f3ef] border border-black/10 flex items-center justify-center shadow-sm">
            <Users className="text-[#111413] w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-[#111413]/60 uppercase tracking-wider">Talent</span>
        </motion.div>
      </div>
    </div>
  );
}
