import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function PrivacyPolicyPage() {
  return (
    <>
      <SEO title="Privacy Policy | Headhunters.lk" description="Privacy Policy for Headhunters.lk." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] px-5 max-w-[1200px] mx-auto text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#04a891]">Privacy Policy</h1>
        <div className="prose prose-invert max-w-4xl">
          <p className="text-white/70 mb-4">
            At Headhunters.lk, we take your privacy seriously. This privacy policy outlines how we collect, use, and protect your personal information in connection with our recruitment and HR services in Sri Lanka.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-white/70 mb-4">
            We may collect personal information such as your name, contact details, employment history, qualifications, and other information relevant to the recruitment process when you register as a candidate or submit a job application.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-white/70 mb-4">
            Your information is used solely for the purpose of matching you with potential employment opportunities, providing HR consulting services, and communicating with you regarding your career prospects.
          </p>
          <p className="text-white/70 mt-8">
            [Full policy content pending legal approval]
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
