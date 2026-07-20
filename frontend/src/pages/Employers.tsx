import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';

export function EmployersPage() {
  return (
    <>
      <SEO title="For Employers | Headhunters.lk" description="We connect businesses with Sri Lanka top talent through rigorous vetting and deep industry networks." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-[#04a891]">For Employers</h1>
        <p className="text-lg text-white/70 max-w-3xl mb-10">
          We connect businesses with Sri Lanka's top talent through rigorous vetting and deep industry networks.
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Request Staff</h2>
          <p className="text-white/60 mb-6">
            Looking to fill a critical role? Our consultants will respond within 1 hour during business hours with a tailored strategy.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#04a891] text-white font-semibold hover:bg-[#038c79] transition-colors">
            Start a Hiring Request
          </Link>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6">Why Partner With Us?</h2>
          <ul className="space-y-4 text-white/70">
            <li className="flex items-start gap-3">
              <span className="text-[#04a891] font-bold">•</span>
              <span>1-hour response standard</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#04a891] font-bold">•</span>
              <span>Quote within 24 hours</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#04a891] font-bold">•</span>
              <span>Shortlist with care</span>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
