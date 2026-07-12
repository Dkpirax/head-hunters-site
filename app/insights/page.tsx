import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, FileText, BarChart, BookOpen } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Insights & Case Studies",
  description: "Read our latest reports, market analysis and success stories.",
};

export default async function InsightsPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });

  const getIcon = (cat: string) => {
    if (cat === "Case Study") return BarChart;
    if (cat === "Market Report") return FileText;
    return BookOpen;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C]">
        {/* Hero */}
        <section className="pt-36 pb-20 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-5 text-center">
            <p className="eyebrow mb-5">Knowledge Base</p>
            <h1 className="text-[clamp(42px,7vw,84px)] font-black text-white leading-[0.9] tracking-tight mb-6">
              Insights &<br />Case Studies
            </h1>
            <p className="text-white/55 text-[18px] max-w-[560px] mx-auto">
              Market intelligence, hiring strategies and proof of execution from our recent projects.
            </p>
          </div>
        </section>

        {/* Content grid */}
        <section className="pb-32">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.length === 0 ? (
                <div className="col-span-full py-20 text-center border border-white/10 border-dashed rounded-[16px]">
                  <p className="text-white/40 mb-2">Check back soon for new insights.</p>
                </div>
              ) : (
                articles.map((article: any) => {
                  const Icon = getIcon(article.category);
                  return (
                    <Link href={`/insights/${article.slug}`} key={article.id} className="block group">
                      <article className="h-full bg-white/4 border border-white/8 rounded-[16px] p-8 hover:border-[#04a891]/40 hover:bg-white/6 transition-all duration-300 flex flex-col cursor-pointer">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-[10px] bg-[#02695e]/20 border border-[#04a891]/20 flex items-center justify-center shrink-0">
                            <Icon size={18} className="text-[#04a891]" />
                          </div>
                          <span className="text-xs font-semibold text-[#04a891] uppercase tracking-wider">{article.category}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-[#04a891] transition-colors">{article.title}</h2>
                        <p className="text-white/55 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
                          <span className="text-xs text-white/40 font-medium">
                            {new Date(article.createdAt).toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-white font-semibold group-hover:text-[#04a891] transition-colors">
                            Read more <ArrowRight size={14} />
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                })
              )}
            </div>
            
            {articles.length > 0 && (
              <div className="mt-16 text-center">
                <button className="px-6 py-3 rounded-[10px] border border-white/12 text-white text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer">
                  Load more articles
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
