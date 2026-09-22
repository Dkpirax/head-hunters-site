import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, Shield, CheckCircle, FileText, Lock } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export function CandidatesPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-4">
              Candidate Career Services • Sri Lanka
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
              Explore Career Opportunities
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-8">
              Advance your career with Sri Lanka’s premier recruitment consultancy. We represent mid-to-senior professionals, functional directors, and C-suite executives for permanent, confidential, and high-impact appointments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Browse Active Vacancies <ArrowRight size={16} />
              </Link>
              <a
                href="/#contact"
                onClick={() => trackEvent('cv_upload', { source_page: 'candidates_hero' })}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
              >
                Submit Your CV <FileText size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* The Candidate Commitment (Zero Fees) */}
        <section className="border-t border-white/10 bg-[#111413] py-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                <Shield size={32} className="text-[#04a891] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Zero Candidate Fees</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Head Hunters operates strictly on employer-retained mandates. We will never charge candidates any fees for registration, interview arrangement, or placement.
                </p>
              </div>

              <div className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                <Lock size={32} className="text-[#04a891] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Strict Confidentiality</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your current employment status and profile are kept completely private. We never share your resume with any client without your express prior consent.
                </p>
              </div>

              <div className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                <CheckCircle size={32} className="text-[#04a891] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Unadvertised Roles</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  A large portion of executive appointments are confidential and never published on public job boards. Submitting your profile gives you direct visibility to these searches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guidance and Next Steps */}
        <section className="py-20 max-w-[1200px] mx-auto px-5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-4">Ready to Discuss Your Next Career Move?</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Explore current opportunities across finance, legal, corporate leadership, and manufacturing, or register your confidential CV with our executive search team.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                View Jobs <ArrowRight size={14} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
