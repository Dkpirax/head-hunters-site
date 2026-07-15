"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";



export function JobsSection({ recentJobs = [] }: { recentJobs?: any[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <section id="jobs" className="bg-[#f2f3ef] py-28" aria-labelledby="jobs-title">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
          {/* Copy */}
          <div>
            <motion.p className="eyebrow-dark eyebrow mb-4"
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>For candidates</motion.p>
            <motion.h2
              id="jobs-title"
              className="text-[clamp(30px,4.5vw,54px)] font-black text-[#111413] leading-[0.95] tracking-tight mb-5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              The next right move starts here.
            </motion.h2>
            <motion.p className="text-[#111413]/60 text-[17px] leading-relaxed mb-8"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              Search roles, upload your CV, register interest and access resources that help you stay prepared, reachable and confident.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Link href="/jobs"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold transition-all hover:bg-[#027d6f] hover:shadow-[0_10px_28px_rgba(2,105,94,0.3)]">
                Browse all jobs <ArrowRight size={14} />
              </Link>
              <Link href="/#contact"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-[10px] bg-[#111413] text-white text-sm font-semibold hover:bg-black transition-all shadow-sm">
                Upload your CV
              </Link>
            </motion.div>
          </div>

          {/* Job board preview */}
          <div>
            {/* Search bar */}
            <motion.form
              onSubmit={handleSearch}
              className="flex items-center gap-3 mb-4 px-4 h-12 rounded-[12px] border border-black/10 bg-white shadow-sm"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Search size={16} className="text-[#111413]/35 shrink-0" />
              <input
                type="search"
                placeholder="Search jobs, locations or skills..."
                aria-label="Search jobs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm text-[#111413] placeholder:text-[#111413]/35 outline-none bg-transparent"
              />
              <button type="submit" className="h-7 px-4 rounded-[7px] bg-[#02695e] text-white text-xs font-semibold hover:bg-[#027d6f] transition-colors cursor-pointer">
                Search
              </button>
            </motion.form>

            {/* Job cards */}
            <div className="space-y-3">
              {recentJobs.length === 0 ? (
                <div className="py-10 text-center border border-black/10 border-dashed rounded-[16px]">
                  <p className="text-[#111413]/40 text-sm">No recent roles to display.</p>
                </div>
              ) : (
                recentJobs.map((job: any, i: number) => {
                  const badge = job.isHot ? "Red Hot" : job.type;
                  const BADGE_STYLES: Record<string, string> = {
                    "Red Hot": "bg-orange-500 text-white",
                    "REMOTE": "bg-[#02695e] text-white",
                    "PERMANENT": "bg-blue-600 text-white",
                    "CASUAL": "bg-amber-600 text-white",
                    "EXECUTIVE": "bg-purple-600 text-white",
                  };
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 + 0.3 }}>
                      <Link href={`/jobs/${job.id}`} className="block group bg-white rounded-[14px] border border-black/6 p-5 hover:border-[#02695e]/25 hover:shadow-[0_8px_28px_rgba(2,105,94,0.08)] transition-all duration-300 cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wide ${BADGE_STYLES[badge] ?? "bg-black/10 text-black"}`}>
                                {job.isHot && <Flame size={9} />}
                                {badge}
                              </span>
                              <span className="text-xs text-[#111413]/45 font-medium">{job.type}</span>
                            </div>
                            <h3 className="text-[#111413] font-bold text-lg leading-tight mb-1 group-hover:text-[#02695e] transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-[#111413]/55">{job.location}</p>
                          </div>
                          <div className="shrink-0 w-9 h-9 rounded-[8px] border border-black/8 grid place-items-center group-hover:bg-[#02695e] group-hover:border-[#02695e] transition-all duration-200">
                            <ArrowRight size={15} className="text-[#111413]/30 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>

            <motion.div className="mt-4 text-center"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Link href="/jobs" className="text-sm text-[#02695e] font-semibold hover:underline inline-flex items-center gap-1">
                View all available roles <ArrowRight size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
