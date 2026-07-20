import React, { useEffect, useState } from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ContactSection } from '../components/home/ContactSection';
import { apiClient } from '../lib/api';

export function ContactPage() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    // Fetch settings to pass to ContactSection
    apiClient("/api/settings").then((data) => {
      const mapped = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      setSettings(mapped);
    }).catch(console.error);
  }, []);

  return (
    <>
      <SEO title="Contact Us | Headhunters.lk" description="Get in touch with our team for recruitment solutions or candidate support." />
      <Header />
      <main className="pt-32 pb-10 min-h-[80vh] text-white">
        <div className="px-5 max-w-[1200px] mx-auto mb-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-[#04a891]">Contact Us</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Get in touch with our team for recruitment solutions or candidate support.
          </p>
        </div>
        <ContactSection settings={settings} />
      </main>
      <Footer />
    </>
  );
}
