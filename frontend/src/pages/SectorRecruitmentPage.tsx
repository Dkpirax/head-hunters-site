import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, CheckCircle2, Shield, Briefcase, Users } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export interface SectorConfig {
  slug: string;
  badge: string;
  h1: string;
  subtitle: string;
  description: string;
  roles: string[];
  screeningApproach: string;
  typicalBriefs: string[];
  confidentialityNote?: string;
  relatedLinks: { label: string; url: string }[];
}

export const SECTOR_DATA: Record<string, SectorConfig> = {
  'ceo-recruitment-sri-lanka': {
    slug: 'ceo-recruitment-sri-lanka',
    badge: 'C-Suite Executive Search • Sri Lanka',
    h1: 'CEO and C-Suite Recruitment',
    subtitle: 'Appointing Visionary Executive Leadership for Sri Lankan Enterprises',
    description: 'Securing a Chief Executive Officer, Managing Director, or Country Head requires discrete, consultative headhunting. Head Hunters works directly with board chairs and nomination committees to identify proven leaders capable of driving commercial growth, capital efficiency, and digital transformation.',
    roles: [
      'Chief Executive Officer (CEO)',
      'Managing Director / Country Head',
      'Chief Operating Officer (COO)',
      'Executive Board Directors'
    ],
    screeningApproach: 'Rigorous assessment of track record across enterprise P&L management, shareholder governance, crisis mitigation, and executive leadership style.',
    typicalBriefs: [
      'Enterprise turnaround and operational transformation',
      'Family business governance transition to professional leadership',
      'Multinational subsidiary expansion in Sri Lanka and regional markets'
    ],
    confidentialityNote: 'CEO searches are conducted under strict non-disclosure protocol with all prospective candidate meetings arranged in neutral off-site locations.',
    relatedLinks: [
      { label: 'Executive Search', url: '/executive-search-sri-lanka' },
      { label: 'Confidential Recruitment', url: '/confidential-recruitment-sri-lanka' },
      { label: 'Finance Recruitment', url: '/finance-recruitment-sri-lanka' },
      { label: 'For Employers', url: '/employers' },
    ]
  },
  'finance-recruitment-sri-lanka': {
    slug: 'finance-recruitment-sri-lanka',
    badge: 'Finance & Accounting • Colombo & Nationwide',
    h1: 'Finance and Accounting Recruitment',
    subtitle: 'Securing Strategic Financial Leaders and Accounting Specialists',
    description: 'From Chief Financial Officers to Financial Controllers and Treasury Managers, Head Hunters places qualified finance professionals across banking, conglomerates, technology, and manufacturing sectors in Sri Lanka.',
    roles: [
      'Chief Financial Officer (CFO)',
      'Head of Finance / Financial Controller',
      'Treasury & Tax Director',
      'Commercial Finance & FP&A Managers',
      'Senior Accountant / Chief Accountant'
    ],
    screeningApproach: 'Validation of professional credentials (CA Sri Lanka, CIMA, ACCA, CFA), evaluation of complex IFRS compliance capability, debt/equity restructuring track record, and commercial acumen.',
    typicalBriefs: [
      'Capital restructuring and IPO preparation',
      'Cross-border tax planning and statutory compliance',
      'Enterprise ERP financial implementation and controls'
    ],
    relatedLinks: [
      { label: 'Internal Audit Recruitment', url: '/internal-audit-recruitment-sri-lanka' },
      { label: 'Executive Search', url: '/executive-search-sri-lanka' },
      { label: 'CEO Recruitment', url: '/ceo-recruitment-sri-lanka' },
      { label: 'Active Finance Jobs', url: '/jobs' },
    ]
  },
  'internal-audit-recruitment-sri-lanka': {
    slug: 'internal-audit-recruitment-sri-lanka',
    badge: 'Governance, Risk & Compliance • Sri Lanka',
    h1: 'Internal Audit Recruitment',
    subtitle: 'Protecting Enterprise Value with Senior Audit & Risk Professionals',
    description: 'Modern internal audit is a strategic advisory function, not just compliance. We identify and place Heads of Internal Audit, Risk Managers, and Compliance Directors who bring rigorous governance and operational insight.',
    roles: [
      'Head of Internal Audit',
      'Chief Risk Officer (CRO)',
      'Internal Audit Manager',
      'IT Audit & Cyber Risk Specialist',
      'Regulatory Compliance Director'
    ],
    screeningApproach: 'Verification of CIA, CISA, CA, and forensic audit qualifications; structured review of board audit committee reporting experience and internal control design.',
    typicalBriefs: [
      'Central Bank regulatory compliance and risk modeling',
      'Enterprise fraud prevention and forensic audit frameworks',
      'Group-wide operational audit restructuring'
    ],
    relatedLinks: [
      { label: 'Finance Recruitment', url: '/finance-recruitment-sri-lanka' },
      { label: 'Legal Recruitment', url: '/legal-recruitment-sri-lanka' },
      { label: 'Employers Hub', url: '/employers' },
      { label: 'Jobs', url: '/jobs' },
    ]
  },
  'legal-recruitment-sri-lanka': {
    slug: 'legal-recruitment-sri-lanka',
    badge: 'Corporate Legal & Governance • Colombo',
    h1: 'Legal Recruitment',
    subtitle: 'Corporate Counsels, Legal Directors, and Regulatory Specialists',
    description: 'We connect corporate boards and leading organizations with exceptional legal talent. From in-house General Counsels navigating complex Sri Lankan corporate law to specialized commercial legal officers.',
    roles: [
      'General Counsel / Head of Legal',
      'Senior Legal Officer / In-House Counsel',
      'Company Secretary (Chartered)',
      'Regulatory & Compliance Counsel',
      'Commercial Contracts Manager'
    ],
    screeningApproach: 'Assessment of Bar admission, Supreme Court enrollment, corporate transaction history, dispute resolution capabilities, and commercial pragmatism.',
    typicalBriefs: [
      'Cross-border joint ventures and commercial agreements',
      'Capital market regulatory filings and compliance',
      'Intellectual property, data protection, and dispute oversight'
    ],
    relatedLinks: [
      { label: 'Internal Audit Recruitment', url: '/internal-audit-recruitment-sri-lanka' },
      { label: 'Executive Search', url: '/executive-search-sri-lanka' },
      { label: 'Confidential Appointments', url: '/confidential-recruitment-sri-lanka' },
      { label: 'Contact Team', url: '/contact' },
    ]
  },
  'hr-recruitment-sri-lanka': {
    slug: 'hr-recruitment-sri-lanka',
    badge: 'People & Culture Leadership • Sri Lanka',
    h1: 'HR Recruitment',
    subtitle: 'Strategic Human Resource Directors and People Leaders',
    description: 'Transforming organizational culture and driving talent retention begins with world-class HR leadership. Head Hunters specializes in placing Chief Human Resource Officers, Talent Acquisition Directors, and Industrial Relations experts.',
    roles: [
      'Chief People Officer / HR Director',
      'Head of Talent Acquisition',
      'Industrial Relations & Labor Specialist',
      'Compensation & Benefits (C&B) Lead',
      'Organizational Development Manager'
    ],
    screeningApproach: 'Evaluation of labor law knowledge (Shop and Office Employees Act, Industrial Disputes Act), employee engagement metrics, HR tech stack implementations, and union negotiations.',
    typicalBriefs: [
      'Culture realignment and leadership development',
      'Rapid workforce scaling and employer branding',
      'Dispute resolution and collective bargaining agreements'
    ],
    relatedLinks: [
      { label: 'Executive Search', url: '/executive-search-sri-lanka' },
      { label: 'Employers Hub', url: '/employers' },
      { label: 'Confidential Recruitment', url: '/confidential-recruitment-sri-lanka' },
      { label: 'Active Jobs', url: '/jobs' },
    ]
  },
  'fmcg-recruitment-sri-lanka': {
    slug: 'fmcg-recruitment-sri-lanka',
    badge: 'FMCG, Manufacturing & Supply Chain • Sri Lanka',
    h1: 'FMCG and Manufacturing Recruitment',
    subtitle: 'Operational, Factory, and Commercial Leaders for Industry',
    description: 'Sri Lanka’s manufacturing and FMCG leaders require executives who balance technical operational discipline with dynamic retail distribution networks. We place factory directors, supply chain heads, and national sales managers.',
    roles: [
      'Factory / Plant Director',
      'Head of Supply Chain & Logistics',
      'National Sales Manager (FMCG)',
      'Quality Assurance & Safety Director',
      'General Manager - Manufacturing'
    ],
    screeningApproach: 'Assessment of Lean Six Sigma, total productive maintenance (TPM), route-to-market distribution expertise, and plant labor management.',
    typicalBriefs: [
      'Factory efficiency modernization and export compliance',
      'Islandwide FMCG distributor network expansion',
      'Warehouse automation and procurement cost reduction'
    ],
    relatedLinks: [
      { label: 'CEO Recruitment', url: '/ceo-recruitment-sri-lanka' },
      { label: 'Finance Recruitment', url: '/finance-recruitment-sri-lanka' },
      { label: 'Employers Hub', url: '/employers' },
      { label: 'Jobs', url: '/jobs' },
    ]
  }
};

export function SectorRecruitmentPage({ sectorKey }: { sectorKey: string }) {
  const config = SECTOR_DATA[sectorKey];

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
        <p>Sector page not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-4">
              {config.badge}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
              {config.h1}
            </h1>
            <p className="text-xl text-[#04a891] font-semibold mb-4">
              {config.subtitle}
            </p>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              {config.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                onClick={() => trackEvent('phone_click', { sector: config.slug })}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Hire in this Discipline <ArrowRight size={16} />
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
              >
                Explore Relevant Openings
              </Link>
            </div>
          </div>
        </section>

        {/* Roles & Typical Briefs */}
        <section className="border-t border-white/10 bg-[#111413] py-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-black text-white mb-6">Key Positions We Appoint</h2>
                <div className="space-y-3">
                  {config.roles.map((r) => (
                    <div key={r} className="p-4 rounded-[10px] bg-[#0B0B0C] border border-white/8 flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-[#04a891] shrink-0" />
                      <span className="font-semibold text-white/90">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white mb-6">Typical Hiring Briefs</h2>
                <div className="space-y-4">
                  {config.typicalBriefs.map((b, i) => (
                    <div key={i} className="p-5 rounded-[12px] bg-[#0B0B0C] border border-white/8">
                      <span className="text-xs font-bold text-[#04a891] uppercase tracking-wider block mb-1">Scenario {i + 1}</span>
                      <p className="text-sm text-white/70">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screening & Confidentiality */}
        <section className="py-20 max-w-[1200px] mx-auto px-5">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-white mb-4">Our Candidate Screening Approach</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              {config.screeningApproach}
            </p>
            {config.confidentialityNote && (
              <div className="p-5 rounded-[12px] bg-[#02695e]/15 border border-[#04a891]/30 flex items-start gap-4">
                <Shield size={22} className="text-[#04a891] shrink-0 mt-0.5" />
                <p className="text-sm text-white/80 leading-relaxed">
                  <strong>Confidentiality Assurance:</strong> {config.confidentialityNote}
                </p>
              </div>
            )}
            <div className="mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
              >
                Submit a Vacancy Brief <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Related Services Internal Links */}
        <section className="border-t border-white/10 bg-[#0B0B0C] py-12">
          <div className="max-w-[1200px] mx-auto px-5 flex flex-wrap items-center justify-between gap-4 text-sm">
            <span className="text-white/50 font-medium">Related Disciplines & Pathways:</span>
            <div className="flex flex-wrap gap-4 text-white/80 font-medium">
              {config.relatedLinks.map((l) => (
                <Link key={l.url} to={l.url} className="hover:text-[#04a891] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
