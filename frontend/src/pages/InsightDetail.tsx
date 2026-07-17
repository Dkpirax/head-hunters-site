import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, BarChart, BookOpen } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { apiClient } from "@/lib/api";

export function InsightDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient(`/api/articles/${slug}`)
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load article", err);
        setError("Article not found or failed to load.");
        setLoading(false);
      });
  }, [slug]);

  const getIcon = (cat: string) => {
    if (cat === "Case Study") return BarChart;
    if (cat === "Market Report") return FileText;
    return BookOpen;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#04a891] border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer settings={{}} />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#0B0B0C] pt-36 pb-20 flex flex-col items-center justify-center text-center px-5">
          <h1 className="text-4xl font-bold text-white mb-4">Insight Not Found</h1>
          <p className="text-white/60 mb-8 max-w-[400px]">The insight or case study you're looking for doesn't exist or has been removed.</p>
          <Link to="/insights" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#02695e] hover:bg-[#027d6f] text-white text-sm font-bold transition-all cursor-pointer">
            <ArrowLeft size={16} /> Back to Insights
          </Link>
        </main>
        <Footer settings={{}} />
      </>
    );
  }

  const Icon = getIcon(article.category);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C]">
        <article className="pt-36 pb-20 max-w-[800px] mx-auto px-5">
          <Link to="/insights" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 text-sm font-semibold">
            <ArrowLeft size={16} /> Back to Insights
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#02695e]/20 border border-[#04a891]/20">
              <Icon size={14} className="text-[#04a891]" />
              <span className="text-[11px] font-bold text-[#04a891] uppercase tracking-wider">{article.category}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-sm font-medium">
              <Calendar size={14} />
              {new Date(article.createdAt).toLocaleDateString("en-AU", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-8">
            {article.title}
          </h1>
          
          <div className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-headings:text-white prose-a:text-[#04a891] hover:prose-a:text-[#04a891]/80 mt-12">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p className="text-white/50 italic">No content available.</p>
            )}
          </div>
        </article>
      </main>
      <Footer settings={{}} />
    </>
  );
}
