import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { article as articleTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const articles = await db.select().from(articleTable).where(eq(articleTable.slug, resolvedParams.slug));
  const article = articles[0];

  if (!article || !article.isPublished) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C] pt-32 pb-24">
        <article className="max-w-[800px] mx-auto px-5">
          <Link href="/insights" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-8">
            <ChevronLeft size={16} /> Back to Insights
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-white/40 text-sm">
                <Calendar size={14} />
                {new Date(article.createdAt).toLocaleDateString('en-AU', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-[clamp(32px,4vw,54px)] font-black text-white leading-tight tracking-tight mb-6">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-white/60 leading-relaxed font-medium">
                {article.excerpt}
              </p>
            )}
          </header>

          <div className="prose prose-invert prose-emerald prose-lg max-w-none text-white/80 leading-relaxed">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: article.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-3xl font-bold text-white mt-12 mb-6">$1</h2>')
                  .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-2xl font-bold text-white mt-10 mb-4">$1</h3>')
                  .replace(/\n\n/g, '</p><p class="mb-6">')
                  .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
                  .replace(/(<li>[\s\S]*<\/li>)/g, '<ul class="list-disc pl-5 my-6 space-y-2 marker:text-[#04a891]">$1</ul>')
              }} />
            ) : (
              <p className="italic opacity-50">No content provided.</p>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
