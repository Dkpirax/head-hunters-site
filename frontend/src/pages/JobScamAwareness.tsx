import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function JobScamAwarenessPage() {
  return (
    <>
      <SEO title="Job Scam Awareness | Headhunters.lk" description="Important notice regarding recruitment fraud and job scam awareness." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#04a891]">Job Scam Awareness</h1>
        <div className="prose prose-invert max-w-4xl">
          <p className="text-white/70 mb-4 text-lg font-medium">
            Recruitment fraud is a sophisticated fraud offering fictitious job opportunities.
          </p>
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl mb-8">
            <h2 className="text-xl font-bold text-red-400 mb-2">Important Notice</h2>
            <p className="text-white/80">
              Headhunters.lk will <strong>never</strong> ask candidates to pay any fees, make investments, or purchase equipment in order to apply for a role or secure an interview.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">How to Spot a Recruitment Scam</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/70">
            <li>Requests for payment for visas, background checks, or training.</li>
            <li>Communication from non-official email addresses (e.g., Gmail, Yahoo) instead of @headhunters.lk.</li>
            <li>Offers of employment without a formal interview process.</li>
            <li>Requests for sensitive personal information early in the process (e.g., banking details).</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">What to Do</h2>
          <p className="text-white/70 mb-4">
            If you suspect you have been targeted by a recruitment scam using our name, please do not provide any personal information or make any payments. Report the activity to us immediately at <a href="mailto:info@headhunters.lk" className="text-[#04a891] hover:underline">info@headhunters.lk</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
