import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function AboutPage() {
  return (
    <>
      <SEO title="About Us | Headhunters.lk" description="Learn about our Sri Lankan recruitment and HR services company." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-black mb-8 text-[#04a891]">About Us</h1>
        <p className="text-lg text-white/70 max-w-3xl mb-8">
          A Sri Lankan recruitment and HR services company supported by a Switzerland-based parent company with eight years of industry experience. (Pending Legal Approval)
        </p>
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-white/60">Content to be provided based on the full scope document...</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Mission & Values</h2>
            <p className="text-white/60">Content to be provided based on the full scope document...</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="text-white/60">Content to be provided based on the full scope document...</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
