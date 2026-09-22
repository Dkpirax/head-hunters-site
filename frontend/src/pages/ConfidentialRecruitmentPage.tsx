import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, Lock, EyeOff, ShieldCheck, FileCheck } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export function ConfidentialRecruitmentPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-4">
              Discreet Executive Appointments • Sri Lanka
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
              Confidential Recruitment for Sensitive Appointments
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-8">
              Certain executive searches cannot be announced publicly without disrupting share prices, client relationships, or employee morale. Head Hunters provides an air-tight, NDA-governed confidential recruitment service across Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                onClick={() => trackEvent('phone_click', { source_page: 'confidential_hero' })}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Request a Private Briefing <ArrowRight size={16} />
              </Link>
              <Link
                to="/executive-search-sri-lanka"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
              >
                Executive Search Services
              </Link>
            </div>
          </div>
        </section>

        {/* When is Confidential Search Essential? */}
        <section className="border-t border-white/10 bg-[#111413] py-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-3xl font-black text-white mb-8">When Discretion is Paramount</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                <EyeOff size={32} className="text-[#04a891] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Incumbent Replacement</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  When an existing C-suite executive or department head must be transitioned out without triggering internal alarm or team instability before a successor is secured.
                </p>
              </div>

              <div className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                <Lock size={32} className="text-[#04a891] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Unannounced Market Entry</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  When building leadership teams for a new business division, geographical expansion, or product launch that competitors must not detect ahead of time.
                </p>
              </div>

              <div className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                <ShieldCheck size={32} className="text-[#04a891] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">M&A / Restructuring</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  During corporate acquisitions, joint ventures, or restructuring where leadership talent must be identified under strict Non-Disclosure Agreements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security and Protocol */}
        <section className="py-20 max-w-[1200px] mx-auto px-5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-6 text-center">Our Confidential Search Protocol</h2>
            <div className="space-y-4">
              <div className="p-5 rounded-[12px] bg-[#161a19] border border-white/8 flex items-start gap-4">
                <FileCheck size={20} className="text-[#04a891] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-base">Bilateral Non-Disclosure Agreements</h3>
                  <p className="text-sm text-white/60 mt-1">Neither your company identity nor role specifics are shared until prospective candidates execute legally binding non-disclosure agreements.</p>
                </div>
              </div>

              <div className="p-5 rounded-[12px] bg-[#161a19] border border-white/8 flex items-start gap-4">
                <FileCheck size={20} className="text-[#04a891] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-base">Off-Site & Private Interviewing</h3>
                  <p className="text-sm text-white/60 mt-1">Interviews are conducted in neutral executive suites or private virtual environments to avoid sightings on client premises.</p>
                </div>
              </div>

              <div className="p-5 rounded-[12px] bg-[#161a19] border border-white/8 flex items-start gap-4">
                <FileCheck size={20} className="text-[#04a891] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-base">Restricted Internal Access</h3>
                  <p className="text-sm text-white/60 mt-1">Client files and candidate shortlists are held under restricted access, handled strictly by designated senior partners.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Discuss a Sensitive Appointment <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0B0B0C] py-12">
          <div className="max-w-[1200px] mx-auto px-5 flex flex-wrap items-center justify-between gap-4 text-sm">
            <span className="text-white/50 font-medium">Related Services:</span>
            <div className="flex flex-wrap gap-4 text-white/80 font-medium">
              <Link to="/employers" className="hover:text-[#04a891] transition-colors">Employer Hub</Link>
              <Link to="/executive-search-sri-lanka" className="hover:text-[#04a891] transition-colors">Executive Search</Link>
              <Link to="/ceo-recruitment-sri-lanka" className="hover:text-[#04a891] transition-colors">CEO Recruitment</Link>
              <Link to="/candidates" className="hover:text-[#04a891] transition-colors">Candidates</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
