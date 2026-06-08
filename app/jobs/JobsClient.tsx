"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowRight, Flame, MapPin, Clock, Briefcase } from "lucide-react";
import Link from "next/link";

export type Job = {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  isHot: boolean;
  description: string;
  createdAt: Date;
};

const BADGE_STYLES: Record<string, string> = {
  "Red Hot": "bg-orange-500 text-white",
  "REMOTE": "bg-[#02695e] text-white",
  "PERMANENT": "bg-blue-600 text-white",
  "CASUAL": "bg-amber-600 text-white",
  "EXECUTIVE": "bg-purple-600 text-white",
};

export function JobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All roles");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      // 1. Text Search Match
      const matchesSearch = 
        searchQuery === "" || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Tag Match
      let matchesFilter = true;
      if (activeFilter !== "All roles") {
        if (activeFilter === "Casual") matchesFilter = job.type === "CASUAL";
        if (activeFilter === "Permanent") matchesFilter = job.type === "PERMANENT";
        if (activeFilter === "Remote") matchesFilter = job.type === "REMOTE" || job.location.includes("Remote");
        if (activeFilter === "Executive") matchesFilter = job.type === "EXECUTIVE" || job.title.includes("Lead") || job.title.includes("Director");
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, initialJobs]);

  return (
    <>
      {/* Hero & Search area */}
      <section className="pt-36 pb-16 relative overflow-hidden" aria-labelledby="jobs-page-title">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(2,105,94,0.22), transparent 60%)" }} />
        <div className="max-w-[1200px] mx-auto px-5 relative text-center">
          <p className="eyebrow mb-5">Open Roles</p>
          <h1 id="jobs-page-title" className="text-[clamp(42px,7vw,96px)] font-black text-white leading-[0.9] tracking-tight mb-5">
            Find your<br />next move.
          </h1>
          <p className="text-white/55 text-[18px] max-w-[560px] mx-auto mb-10">
            Permanent, casual, remote and executive opportunities across Australia, New Zealand and Sri Lanka.
          </p>

          {/* Search Bar */}
          <div className="max-w-[640px] mx-auto flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 h-12 rounded-[12px] border border-white/10 bg-white/6 backdrop-blur-xl transition-colors focus-within:border-[#04a891]/50 focus-within:bg-white/10">
              <Search size={16} className="text-white/35 shrink-0" />
              <input 
                type="search" 
                placeholder="Role, location or keyword..." 
                aria-label="Search jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none" 
              />
            </div>
            <button className="h-12 px-6 rounded-[12px] bg-[#02695e] text-white text-sm font-semibold hover:bg-[#027d6f] transition-colors cursor-pointer">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="pb-28">
        <div className="max-w-[1200px] mx-auto px-5">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All roles", "Casual", "Permanent", "Remote", "Executive"].map((f) => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                  f === activeFilter
                    ? "bg-[#02695e] text-white border-[#02695e]"
                    : "border-white/10 text-white/55 hover:text-white hover:border-white/25"
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Job cards grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 min-h-[400px] content-start">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center border border-white/10 border-dashed rounded-[16px]">
                <p className="text-white/40 mb-2">No roles found matching &quot;{searchQuery}&quot;</p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveFilter("All roles"); }}
                  className="text-sm text-[#04a891] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const postedDays = Math.max(0, Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
                const badge = job.isHot ? "Red Hot" : job.type;
                
                return (
                  <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                    <article className="h-full bg-white/4 border border-white/8 rounded-[16px] p-6 hover:border-[#04a891]/50 hover:bg-white/6 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wide ${BADGE_STYLES[badge] ?? "bg-white/10 text-white"}`}>
                          {job.isHot && <Flame size={9} />}
                          {badge}
                        </span>
                        <div className="w-8 h-8 rounded-[8px] border border-white/8 grid place-items-center group-hover:bg-[#02695e] group-hover:border-[#02695e] transition-all shrink-0">
                          <ArrowRight size={14} className="text-white/25 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      <h2 className="text-white font-bold text-xl leading-tight mb-3 group-hover:text-[#04a891] transition-colors">
                        {job.title}
                      </h2>

                      <div className="flex flex-wrap gap-3 mb-4 text-xs text-white/45 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin size={11} />{job.location}</span>
                        <span className="flex items-center gap-1.5"><Briefcase size={11} />{job.type}</span>
                        <span className="flex items-center gap-1.5"><Clock size={11} />{postedDays === 0 ? "Today" : `${postedDays}d ago`}</span>
                      </div>

                      <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-5 flex-1">
                        {job.description || "Click to view full job description and apply."}
                      </p>

                      <div className="w-full h-10 flex items-center justify-center rounded-[10px] border border-white/10 text-white/60 text-sm font-medium group-hover:border-[#04a891]/50 group-hover:text-white group-hover:bg-[#04a891]/8 transition-all">
                        View Details & Apply
                      </div>
                    </article>
                  </Link>
                );
              })
            )}
          </div>

          {/* Load more */}
          <div className="mt-10 text-center">
            <p className="text-white/35 text-sm mb-4">Showing {filteredJobs.length} active roles.</p>
            <Link href="/#contact" className="inline-flex items-center gap-2 text-sm text-[#04a891] font-semibold hover:gap-3 transition-all">
              Can&apos;t find the right role? Register your interest
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
