import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, MapPin, Briefcase, ArrowRight, Flame } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.filter((j: any) => j.status === 'ACTIVE'));
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || j.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <section className="max-w-[1200px] mx-auto px-5 py-12">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-3">
              Career Opportunities • Sri Lanka
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Current Opportunities
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Explore active executive, professional, and specialized vacancies across Sri Lanka. Every role is handled directly with our client partners.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title, skill, or location..."
                className="w-full h-12 pl-11 pr-4 rounded-[10px] bg-[#161a19] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#04a891]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-12 px-4 rounded-[10px] bg-[#161a19] border border-white/10 text-white focus:outline-none focus:border-[#04a891]"
            >
              <option value="ALL">All Employment Types</option>
              <option value="PERMANENT">Permanent</option>
              <option value="EXECUTIVE">Executive</option>
              <option value="REMOTE">Remote</option>
              <option value="CASUAL">Casual / Contract</option>
            </select>
          </div>

          {/* Job List */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-[#04a891] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center rounded-[14px] bg-[#111413] border border-white/8">
              <p className="text-white/60 mb-4">No active vacancies currently match your search criteria.</p>
              <Link
                to="/candidates"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#04a891] hover:underline"
              >
                Submit your CV for unadvertised searches <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const canonicalSlug = `${toSlug(job.title)}--${job.id}`;
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${canonicalSlug}`}
                    onClick={() => trackEvent('job_view', { job_id: job.id, job_title: job.title })}
                    className="block p-6 rounded-[14px] bg-[#161a19] border border-white/8 hover:border-[#04a891]/40 transition-all hover:shadow-[0_8px_30px_rgba(4,168,145,0.06)] group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          {job.isHot && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white">
                              <Flame size={10} /> Hot
                            </span>
                          )}
                          <span className="text-xs px-2.5 py-0.5 rounded-[5px] font-semibold bg-white/10 text-white/80">
                            {job.type}
                          </span>
                          <span className="text-xs text-white/50 flex items-center gap-1">
                            <MapPin size={12} /> {job.location || 'Colombo, Sri Lanka'}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-white group-hover:text-[#04a891] transition-colors">
                          {job.title}
                        </h2>
                        <p className="text-sm text-white/60 mt-1 line-clamp-2 max-w-2xl">
                          {job.description.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2 text-sm font-semibold text-[#04a891] group-hover:translate-x-1 transition-transform">
                        View Role <ArrowRight size={15} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Candidate Submission Banner */}
        <section className="max-w-[1200px] mx-auto px-5 mt-12">
          <div className="p-8 rounded-[16px] bg-[#111413] border border-white/8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Don’t see your exact role listed?</h2>
              <p className="text-white/60 text-sm max-w-xl">
                Many senior leadership, board, and confidential appointments are never published publicly. Submit your resume to be matched against confidential client mandates.
              </p>
            </div>
            <Link
              to="/candidates"
              className="shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold hover:bg-[#027d6f] transition-all"
            >
              Submit Confidential CV <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
