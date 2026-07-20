import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function ServicesPage() {
  return (
    <>
      <SEO title="Our Services | Headhunters.lk" description="End-to-end recruitment and HR solutions tailored for the Sri Lankan market." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-black mb-8 text-[#04a891]">Our Services</h1>
        <p className="text-lg text-white/70 max-w-3xl mb-8">
          End-to-end recruitment and HR solutions tailored for the Sri Lankan market.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-3">Executive Search</h2>
            <p className="text-white/60">Targeted headhunting for C-suite and senior leadership roles.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-3">Permanent Recruitment</h2>
            <p className="text-white/60">Finding the right cultural and technical fit for your long-term success.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-3">Recruitment Process Outsourcing (RPO)</h2>
            <p className="text-white/60">Scalable hiring solutions integrated seamlessly with your HR department.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-3">HR Consulting</h2>
            <p className="text-white/60">Strategic advice on compensation, compliance, and organizational design.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
