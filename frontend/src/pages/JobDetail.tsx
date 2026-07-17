import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Briefcase, Clock, Flame } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { apiClient } from "@/lib/api";

const BADGE_STYLES: Record<string, string> = {
  "Red Hot": "bg-orange-500 text-white",
  "REMOTE": "bg-[#02695e] text-white",
  "PERMANENT": "bg-blue-600 text-white",
  "CASUAL": "bg-amber-600 text-white",
  "EXECUTIVE": "bg-purple-600 text-white",
};

export function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient(`/api/jobs/${id}`)
      .then(data => {
        setJob(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load job", err);
        setError("Job not found or failed to load.");
        setLoading(false);
      });
  }, [id]);

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

  if (error || !job) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#0B0B0C] pt-36 pb-20 flex flex-col items-center justify-center text-center px-5">
          <h1 className="text-4xl font-bold text-white mb-4">Job Not Found</h1>
          <p className="text-white/60 mb-8 max-w-[400px]">The role you're looking for doesn't exist or is no longer available.</p>
          <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#02695e] hover:bg-[#027d6f] text-white text-sm font-bold transition-all cursor-pointer">
            <ArrowLeft size={16} /> Back to Jobs
          </Link>
        </main>
        <Footer settings={{}} />
      </>
    );
  }

  const badge = job.isHot ? "Red Hot" : job.type;
  const postedDays = Math.max(0, Math.floor((new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C]">
        <article className="pt-36 pb-20 max-w-[800px] mx-auto px-5">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 text-sm font-semibold">
            <ArrowLeft size={16} /> Back to Jobs
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wide ${BADGE_STYLES[badge] ?? "bg-white/10 text-white"}`}>
              {job.isHot && <Flame size={12} />}
              {badge}
            </span>
          </div>
          
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-6">
            {job.title}
          </h1>
          
          <div className="flex flex-wrap gap-5 mb-10 text-sm text-white/60 font-medium">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-[#04a891]" /> {job.location}</span>
            <span className="flex items-center gap-2"><Briefcase size={16} className="text-[#04a891]" /> {job.type}</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-[#04a891]" /> {postedDays === 0 ? "Posted today" : `Posted ${postedDays}d ago`}</span>
          </div>

          {job.status === "CLOSED" && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mb-10">
              <p className="text-orange-400 font-semibold text-center">This role is currently closed and is no longer accepting applications.</p>
            </div>
          )}
          
          <div className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-headings:text-white prose-a:text-[#04a891] hover:prose-a:text-[#04a891]/80 mt-12 bg-white/5 border border-white/10 rounded-[20px] p-8">
            <h3 className="text-xl font-bold mb-4">About this role</h3>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.status === "ACTIVE" && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => document.querySelector<HTMLButtonElement>('button[aria-label="Open chat"]')?.click()}
                className="h-14 px-10 rounded-[12px] bg-[#04a891] text-white font-bold text-lg hover:bg-[#039682] hover:scale-105 transition-all shadow-[0_8px_30px_rgba(4,168,145,0.4)] cursor-pointer"
              >
                Apply for this Role
              </button>
            </div>
          )}
        </article>
      </main>
      <Footer settings={{}} />
    </>
  );
}
