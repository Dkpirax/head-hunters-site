"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, BarChart, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function InsightsSection({ recentInsights = [] }: { recentInsights?: any[] }) {
  const getIcon = (cat: string) => {
    if (cat === "Case Study") return BarChart;
    if (cat === "Market Report") return FileText;
    return BookOpen;
  };

  return (
    <section className="bg-[#0B0B0C] py-28 relative border-t border-white/6" aria-labelledby="insights-title">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.p className="eyebrow mb-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Knowledge Base
            </motion.p>
            <motion.h2
              id="insights-title"
              className="text-[clamp(32px,5vw,54px)] font-black text-white leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              Market intelligence<br />and execution proof.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Link to="/insights" className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] border border-white/12 bg-white/4 text-white text-sm font-semibold transition-all hover:bg-white/10 hover:border-white/25">
              View all insights <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recentInsights.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-white/10 border-dashed rounded-[16px]">
              <p className="text-white/40 mb-2">No recent insights found.</p>
              <p className="text-white/20 text-sm">Create an article in the admin panel to see it here.</p>
            </div>
          ) : (
            recentInsights.map((article: any, i: number) => {
              const Icon = getIcon(article.category);
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}>
                  <Link to={`/insights/${article.slug}`} className="block group h-full">
                    <article className="h-full bg-[#111413] border border-white/6 rounded-[16px] p-8 hover:border-[#04a891]/40 hover:bg-white/4 transition-all duration-300 flex flex-col cursor-pointer shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-[10px] bg-[#02695e]/15 border border-[#04a891]/20 flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-[#04a891]" />
                        </div>
                        <span className="text-xs font-semibold text-[#04a891] uppercase tracking-wider">{article.category}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-[#04a891] transition-colors">{article.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{article.excerpt}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/6 mt-auto">
                        <span className="text-xs text-white/40 font-medium">
                          {new Date(article.createdAt).toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-[#04a891] font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          Read more <ArrowRight size={14} />
                        </span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
