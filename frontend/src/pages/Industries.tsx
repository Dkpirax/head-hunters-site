import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function IndustriesPage() {
  const industries = [
    "IT & Digital",
    "Finance & Accounting",
    "Sales & Marketing",
    "Human Resources",
    "Administration & Support",
    "Logistics & Supply Chain",
    "Manufacturing",
    "Executive Leadership"
  ];

  return (
    <>
      <SEO title="Industries | Headhunters.lk" description="Specialized recruitment expertise across a broad range of sectors in Sri Lanka." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-[#04a891]">Industries</h1>
        <p className="text-lg text-white/70 max-w-3xl mb-12">
          We have specialized recruitment expertise across a broad range of sectors in Sri Lanka.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {industries.map((ind, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-center">
              <span className="font-semibold">{ind}</span>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
