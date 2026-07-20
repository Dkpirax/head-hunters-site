import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';

export function CandidatesPage() {
  return (
    <>
      <SEO title="For Candidates | Headhunters.lk" description="Take the next step in your career with exclusive opportunities across Sri Lanka." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-[#04a891]">For Candidates</h1>
        <p className="text-lg text-white/70 max-w-3xl mb-10">
          Take the next step in your career. We provide access to exclusive opportunities with top employers across Sri Lanka.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Register Your CV</h2>
            <p className="text-white/60 mb-6">
              Join our talent pool to be considered for unadvertised roles and receive job alerts matched to your skills.
            </p>
            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#04a891] text-white font-semibold hover:bg-[#038c79] transition-colors">
              Upload CV
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Browse Jobs</h2>
            <p className="text-white/60 mb-6">
              Explore our current open positions across various industries in Sri Lanka.
            </p>
            <Link to="/jobs" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors">
              View Vacancies
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
