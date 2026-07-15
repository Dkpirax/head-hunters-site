"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getArticles, deleteArticle, createArticle, updateArticle } from "./actions";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const openNew = () => {
    setEditing({ id: "new", title: "", slug: "", category: "Case Study", excerpt: "", content: "", isPublished: false });
    setIsNew(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title || !editing.slug) {
      alert("Title and Slug are required");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createArticle({
          title: editing.title,
          slug: editing.slug,
          category: editing.category,
          excerpt: editing.excerpt,
          content: editing.content,
          isPublished: editing.isPublished
        });
      } else {
        await updateArticle(editing.id, {
          title: editing.title,
          slug: editing.slug,
          category: editing.category,
          excerpt: editing.excerpt,
          content: editing.content,
          isPublished: editing.isPublished
        });
      }
      const updated = await getArticles();
      setArticles(updated);
      setEditing(null);
      setIsNew(false);
    } catch (err: any) {
      alert(err.message || "Failed to save article. Check if slug is unique.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteArticle(id);
      const updated = await getArticles();
      setArticles(updated);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete article.");
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Insights & Case Studies</h1>
          <p className="text-white/40 text-sm">
            {loading ? "Loading..." : `${articles.filter((a) => a.isPublished).length} published · ${articles.length} total`}
          </p>
        </div>
        <Button onClick={openNew} variant="solid" size="md">
          <Plus size={15} /> New Article
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0f1110] z-10">
              <tr className="border-b border-white/6 bg-[#0f1110]">
                {["Title", "Category", "Slug", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {articles.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-white/40">No articles found. Create one to get started.</td></tr>
              )}
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 text-white font-medium">{article.title}</td>
                  <td className="px-5 py-4 text-white/50">{article.category}</td>
                  <td className="px-5 py-4 text-white/40">/{article.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase ${article.isPublished ? "bg-[#04a891]/15 text-[#04a891]" : "bg-white/8 text-white/30"}`}>
                      {article.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditing(article); setIsNew(false); }}
                        className="p-1.5 rounded-[6px] text-white/30 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
                        <Pencil size={13} />
                      </button>
                      {deletingId === article.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => remove(article.id)} className="px-2 py-1 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-[4px] uppercase transition-colors">Confirm</button>
                          <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white rounded-[4px] uppercase transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(article.id)}
                          className="p-1.5 rounded-[6px] text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[800px] bg-[#111413] border border-white/10 rounded-[20px] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] my-auto mt-[10vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">{isNew ? "New Article" : "Edit Article"}</h2>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="art-title" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Title</label>
                  <input id="art-title" value={editing.title}
                    onChange={(e) => {
                      // auto-generate slug if it's new and user hasn't typed a custom slug
                      const newSlug = isNew ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : editing.slug;
                      setEditing({ ...editing, title: e.target.value, slug: isNew && editing.title === editing.slug.replace(/-/g, ' ') ? newSlug : editing.slug });
                    }}
                    placeholder="e.g. Scaling a logistics workforce"
                    className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all" />
                </div>
                <div>
                  <label htmlFor="art-slug" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">URL Slug</label>
                  <input id="art-slug" value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    placeholder="e.g. scaling-logistics"
                    className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label htmlFor="art-cat" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Category</label>
                <select id="art-cat" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-[#111413] text-white text-sm focus:border-[#04a891]/60 outline-none cursor-pointer">
                  <option value="Case Study">Case Study</option>
                  <option value="Market Report">Market Report</option>
                  <option value="Guide">Guide</option>
                  <option value="News">News</option>
                </select>
              </div>

              <div>
                <label htmlFor="art-excerpt" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Excerpt (Summary)</label>
                <textarea id="art-excerpt" value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Short description shown on the cards..."
                  className="w-full h-20 px-4 py-3 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all resize-none" />
              </div>

              <div>
                <label htmlFor="art-content" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">Full Content (Markdown)</label>
                <textarea id="art-content" value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="Write the full article here using Markdown..."
                  className="w-full h-[300px] px-4 py-3 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all resize-y font-mono" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-[#02695e]" />
                <span className="text-sm text-white/70">Publish immediately</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-white/6">
              <Button onClick={save} disabled={saving} variant="solid" size="md" className="gap-2">
                <CheckCircle size={15} /> {saving ? "Saving..." : (isNew ? "Create Article" : "Save changes")}
              </Button>
              <Button onClick={() => setEditing(null)} variant="ghost" size="md">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
