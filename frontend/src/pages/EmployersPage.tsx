import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, ShieldCheck, Search, Users, CheckCircle2, Briefcase } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export function EmployersPage() {
  const sectors = [
    { name: 'Executive Search', path: '/executive-search-sri-lanka', desc: 'Board, MD, and C-Suite leadership placements.' },
    { name: 'Confidential Recruitment', path: '/confidential-recruitment-sri-lanka', desc: 'Discreet leadership appointments with strict NDA governance.' },
    { name: 'CEO & Leadership', path: '/ceo-recruitment-sri-lanka', desc: 'Executive leadership to steer organizational growth.' },
    { name: 'Finance & Accounting', path: '/finance-recruitment-sri-lanka', desc: 'CFOs, Financial Controllers, and senior accounting specialists.' },
    { name: 'Internal Audit & Risk', path: '/internal-audit-recruitment-sri-lanka', desc: 'Audit leaders, compliance heads, and risk governance professionals.' },
    { name: 'Legal Recruitment', path: '/legal-recruitment-sri-lanka', desc: 'General Counsels, senior legal officers, and corporate partners.' },
    { name: 'HR Recruitment', path: '/hr-recruitment-sri-lanka', desc: 'Chief People Officers, HR Directors, and talent acquisition heads.' },
    { name: 'FMCG & Manufacturing', path: '/fmcg-recruitment-sri-lanka', desc: 'Plant directors, supply chain leaders, and commercial heads.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-4">
              Employer Talent Solutions • Sri Lanka
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
              Find the Right People for Critical Roles
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-8">
              Head Hunters partners with corporate boards, managing directors, and HR leadership across Sri Lanka to identify, assess, and secure exceptional talent. From confidential executive search to high-impact functional appointments, we deliver precision hiring with guaranteed replacement protection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                onClick={() => trackEvent('phone_click', { source_page: 'employers_hero' })}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Talk to Our Recruitment Team <ArrowRight size={16} />
              </Link>
              <Link
                to="/executive-search-sri-lanka"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
              >
                Executive Search <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Specialized Sectors Grid */}
        <section className="border-t border-white/10 bg-[#111413] py-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-white mb-3">Specialized Recruitment Disciplines</h2>
              <p className="text-white/60 max-w-2xl">
                We focus on high-impact sectors where domain knowledge, market discretion, and deep executive networks make the difference.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectors.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  className="group block p-6 rounded-[14px] bg-[#0B0B0C] border border-white/8 hover:border-[#04a891]/40 transition-all hover:shadow-[0_8px_30px_rgba(4,168,145,0.08)]"
                >
                  <Briefcase size={22} className="text-[#04a891] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-white group-hover:text-[#04a891] transition-colors mb-2">
                    {s.name}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    {s.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#04a891]">
                    Learn more <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Our Search & Screening Methodology */}
        <section className="py-20 max-w-[1200px] mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Our Rigorous Assessment & Search Framework
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#02695e]/20 text-[#04a891] grid place-items-center shrink-0 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">In-Depth Briefing & Cultural Alignment</h3>
                    <p className="text-white/60 text-sm mt-1">We analyze not just technical competencies, but stakeholder expectations, leadership dynamics, and long-term organizational goals.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#02695e]/20 text-[#04a891] grid place-items-center shrink-0 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Targeted Market Mapping & Headhunting</h3>
                    <p className="text-white/60 text-sm mt-1">We systematically map passive senior executives currently performing in target sectors across Colombo and Sri Lanka.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#02695e]/20 text-[#04a891] grid place-items-center shrink-0 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Multi-Stage Vetting & Credential Checks</h3>
                    <p className="text-white/60 text-sm mt-1">Every shortlisted candidate undergoes structured behavioral interviewing, professional qualification verification, and discreet referencing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[16px] bg-[#161a19] border border-white/10">
              <ShieldCheck size={36} className="text-[#04a891] mb-4" />
              <h3 className="text-2xl font-black text-white mb-3">Our Placement Commitment</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Every placement is backed by a structured guarantee. If a candidate leaves within the agreed replacement guarantee window, Head Hunters provides a full replacement search at no additional professional fee.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle2 size={16} className="text-[#04a891]" />
                  <span>Transparent fee structures agreed upfront</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle2 size={16} className="text-[#04a891]" />
                  <span>Strict NDA protection for sensitive leadership appointments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle2 size={16} className="text-[#04a891]" />
                  <span>Direct consultant communication throughout the search lifecycle</span>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="block text-center w-full py-3.5 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
                >
                  Initiate an Employer Hiring Brief
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
