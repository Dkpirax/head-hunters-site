import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function TermsAndConditionsPage() {
  return (
    <>
      <SEO title="Terms and Conditions | Headhunters.lk" description="Terms and Conditions for Headhunters.lk." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#04a891]">Terms and Conditions</h1>
        <div className="prose prose-invert max-w-4xl">
          <p className="text-white/70 mb-4">
            These terms and conditions govern your use of the Headhunters.lk website and our recruitment services. By accessing or using our platform, you agree to be bound by these terms.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. General Terms</h2>
          <p className="text-white/70 mb-4">
            Headhunters.lk provides recruitment and HR services in Sri Lanka, supported by our Switzerland-based parent company. The content on this website is provided for general information purposes only.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Candidate Obligations</h2>
          <p className="text-white/70 mb-4">
            Candidates must ensure that all information provided to us, including CVs and qualifications, is accurate and truthful. We reserve the right to verify this information during the recruitment process.
          </p>
          <p className="text-white/70 mt-8">
            [Full terms content pending legal approval]
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
