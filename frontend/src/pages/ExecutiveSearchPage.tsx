import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, Target, Shield, Award, Users, CheckCircle } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export function ExecutiveSearchPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-4">
              Executive Search Sri Lanka • Board & C-Suite
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
              Executive Search for Senior and Leadership Roles
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-8">
              Securing transformational leadership requires targeted headhunting, deep market intelligence, and absolute confidentiality. Head Hunters delivers retained executive search services for managing directors, board members, and functional vice presidents across Colombo and Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                onClick={() => trackEvent('phone_click', { source_page: 'executive_search_hero' })}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Initiate a Confidential Search <ArrowRight size={16} />
              </Link>
              <Link
                to="/confidential-recruitment-sri-lanka"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
              >
                Confidential Search Protocol
              </Link>
            </div>
          </div>
        </section>

        {/* Roles Covered */}
        <section className="border-t border-white/10 bg-[#111413] py-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-3xl font-black text-white mb-8">Leadership Roles We Specialize In</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Chief Executive Officer (CEO)', desc: 'Enterprise leadership, operational turnaround, and board succession.' },
                { title: 'Chief Financial Officer (CFO)', desc: 'Capital allocation, corporate restructuring, and financial governance.' },
                { title: 'Chief Operating Officer (COO)', desc: 'Supply chain scaling, manufacturing optimization, and commercial execution.' },
                { title: 'General Counsel & Legal', desc: 'Corporate governance, regulatory compliance, and cross-border transactions.' },
              ].map((role) => (
                <div key={role.title} className="p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8">
                  <Target size={24} className="text-[#04a891] mb-3" />
                  <h3 className="font-bold text-white text-lg mb-2">{role.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Retained Search Process */}
        <section className="py-20 max-w-[1200px] mx-auto px-5">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
            Our 5-Stage Executive Search Methodology
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-[14px] bg-[#161a19] border border-white/8">
              <span className="text-2xl font-black text-[#04a891]">01</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Market & Role Blueprint</h3>
              <p className="text-sm text-white/60">We formulate the target candidate profile, core leadership competencies, and organizational scope with the board or committee.</p>
            </div>
            <div className="p-6 rounded-[14px] bg-[#161a19] border border-white/8">
              <span className="text-2xl font-black text-[#04a891]">02</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Discrete Headhunting</h3>
              <p className="text-sm text-white/60">Direct, discreet outreach to high-performing passive executives without public job postings or market disclosure.</p>
            </div>
            <div className="p-6 rounded-[14px] bg-[#161a19] border border-white/8">
              <span className="text-2xl font-black text-[#04a891]">03</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Competency Assessment</h3>
              <p className="text-sm text-white/60">Thorough evaluation of past performance, crisis leadership capability, and cultural alignment.</p>
            </div>
            <div className="p-6 rounded-[14px] bg-[#161a19] border border-white/8">
              <span className="text-2xl font-black text-[#04a891]">04</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Referencing & Verification</h3>
              <p className="text-sm text-white/60">Discrete 360-degree referencing with industry peers and verified qualification validation.</p>
            </div>
            <div className="p-6 rounded-[14px] bg-[#161a19] border border-white/8">
              <span className="text-2xl font-black text-[#04a891]">05</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Offer & Transition Support</h3>
              <p className="text-sm text-white/60">Independent counsel through complex executive compensation negotiations, sign-ons, and notice periods.</p>
            </div>
            <div className="p-6 rounded-[14px] bg-[#02695e]/15 border border-[#04a891]/30 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-white mb-2">Begin a Search Brief</h3>
              <p className="text-sm text-white/70 mb-4">Connect with our senior executive search partners in Colombo.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#04a891] hover:underline">
                Schedule a consultation <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Linking Strip */}
        <section className="border-t border-white/10 bg-[#0B0B0C] py-12">
          <div className="max-w-[1200px] mx-auto px-5 flex flex-wrap items-center justify-between gap-4 text-sm">
            <span className="text-white/50 font-medium">Related Services:</span>
            <div className="flex flex-wrap gap-4 text-white/80 font-medium">
              <Link to="/employers" className="hover:text-[#04a891] transition-colors">Employer Hub</Link>
              <Link to="/confidential-recruitment-sri-lanka" className="hover:text-[#04a891] transition-colors">Confidential Search</Link>
              <Link to="/ceo-recruitment-sri-lanka" className="hover:text-[#04a891] transition-colors">CEO Recruitment</Link>
              <Link to="/finance-recruitment-sri-lanka" className="hover:text-[#04a891] transition-colors">Finance Leadership</Link>
              <Link to="/jobs" className="hover:text-[#04a891] transition-colors">Active Vacancies</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
