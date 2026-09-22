import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-36 pb-24 max-w-[800px] mx-auto px-5 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#04a891] mb-3">Error 404</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Page Not Found</h1>
        <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          The page you requested does not exist or has been relocated. Explore our active vacancies or recruitment services below.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all"
          >
            <ArrowLeft size={14} /> Return to Homepage
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
          >
            <Search size={14} /> Browse Active Jobs
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
