import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MapPin, Briefcase, Calendar, ArrowLeft, Send, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

function extractId(param: string): string {
  if (param.includes('--')) {
    return param.split('--').pop() || param;
  }
  return param;
}

export function JobDetailPage() {
  const { slugWithId } = useParams<{ slugWithId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugWithId) return;
    const identifier = extractId(slugWithId);

    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs/by-slug/${identifier}`);
        if (res.status === 404) {
          setError('Job not found');
          return;
        }
        if (res.status === 410) {
          setError('This vacancy has expired and is now closed.');
          return;
        }
        if (!res.ok) {
          setError('Unable to load vacancy details.');
          return;
        }
        const data = await res.json();
        setJob(data);
        trackEvent('job_view', { job_id: data.id, job_title: data.title });
      } catch (err) {
        console.error('Failed to load job details:', err);
        setError('Error loading job details');
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [slugWithId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#04a891] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white">
        <Header />
        <main className="pt-36 pb-24 max-w-[800px] mx-auto px-5 text-center">
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-3">Vacancy Notice</h1>
          <p className="text-white/70 mb-8">{error || 'Job not found'}</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f]"
            >
              <ArrowLeft size={14} /> Browse Current Opportunities
            </Link>
            <Link
              to="/candidates"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15"
            >
              Submit General CV
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const datePosted = job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-GB') : '';

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <div className="max-w-[1000px] mx-auto px-5 py-8">
          {/* Breadcrumbs & Back */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link to="/jobs" className="hover:text-white flex items-center gap-1">
              <ArrowLeft size={14} /> Back to all jobs
            </Link>
            <span>/</span>
            <span className="text-white/80 truncate">{job.title}</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
            {/* Main Content */}
            <div className="p-8 rounded-[16px] bg-[#111413] border border-white/8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs px-3 py-1 rounded-[6px] font-semibold bg-[#02695e]/20 text-[#04a891] border border-[#04a891]/30">
                  {job.type}
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#04a891]" /> {job.location || 'Colombo, Sri Lanka'}
                </span>
                {datePosted && (
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <Calendar size={13} /> Posted {datePosted}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                {job.title}
              </h1>

              {/* Description */}
              <div className="border-t border-white/8 pt-6">
                <h2 className="text-lg font-bold text-white mb-4">Job Description & Requirements</h2>
                <div className="text-white/80 leading-relaxed space-y-4 whitespace-pre-wrap text-[15px]">
                  {job.description}
                </div>
              </div>

              {/* Application Callout */}
              <div className="mt-10 p-6 rounded-[12px] bg-[#161a19] border border-white/8">
                <h3 className="font-bold text-white text-lg mb-2">How to Apply</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  To apply for this role, send your resume directly to our recruitment team with the job title in the subject line. All inquiries are treated with strict confidentiality.
                </p>
                <a
                  href={`mailto:info@headhunters.lk?subject=Application: ${encodeURIComponent(job.title)} (Ref: ${job.id})`}
                  onClick={() => trackEvent('job_apply_complete', { job_id: job.id, job_title: job.title })}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold hover:bg-[#027d6f] transition-all"
                >
                  <Send size={14} /> Email CV to info@headhunters.lk
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Confidentiality Notice */}
              <div className="p-6 rounded-[14px] bg-[#111413] border border-white/8">
                <Shield size={24} className="text-[#04a891] mb-3" />
                <h3 className="font-bold text-white text-base mb-2">Recruitment Process</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-3">
                  This search is managed directly by Head Hunters Sri Lanka. We represent vetted candidates to our client hiring committee under bilateral confidentiality terms.
                </p>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#04a891]" />
                    <span>No candidate fees ever charged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#04a891]" />
                    <span>Strict privacy guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Internal Linking Links */}
              <div className="p-6 rounded-[14px] bg-[#111413] border border-white/8">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3 text-white/50">
                  Explore Related Sectors
                </h3>
                <div className="space-y-2.5 text-sm">
                  <Link to="/finance-recruitment-sri-lanka" className="block text-white/80 hover:text-[#04a891] transition-colors">
                    Finance & Accounting Roles
                  </Link>
                  <Link to="/executive-search-sri-lanka" className="block text-white/80 hover:text-[#04a891] transition-colors">
                    Executive Search Services
                  </Link>
                  <Link to="/confidential-recruitment-sri-lanka" className="block text-white/80 hover:text-[#04a891] transition-colors">
                    Confidential Searches
                  </Link>
                  <Link to="/candidates" className="block text-white/80 hover:text-[#04a891] transition-colors">
                    Candidate Career Advisory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
