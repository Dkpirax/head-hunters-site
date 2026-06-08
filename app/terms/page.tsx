import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Scale, Users, FileSignature, AlertCircle, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service governing the use of the Head Hunters recruitment platform and workforce solutions.",
};

export default function TermsOfServicePage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: Scale,
      text: "By accessing or using the Head Hunters portal, services, or tools, you agree to be bound by these Terms of Service. These conditions apply to all visitors, registered candidates, and employer clients who utilize our resources.",
    },
    {
      title: "2. Candidate Applications",
      icon: Users,
      text: "Candidates submitting CVs or applications must provide accurate, current, and honest professional details. Head Hunters reserves the right to share application documents with hiring clients upon matching. Submission of details does not guarantee placement or matching outcomes.",
    },
    {
      title: "3. Employer Client Relations",
      icon: FileSignature,
      text: "Employers utilizing the portal to find staff agree to adhere to specific search agreements, recruitment agency terms, and payment structures defined in separate signed service agreements. Job descriptions must comply with fair work regulations.",
    },
    {
      title: "4. Limitation of Liability",
      icon: AlertCircle,
      text: "Head Hunters is not liable for any damages resulting from candidate placements, performance, job description inaccuracies, or temporary service disruptions on this site. Our services are provided on an 'as-is' basis.",
    },
    {
      title: "5. Jurisdiction & Disputes",
      icon: MapPin,
      text: "These terms are governed by and construed in accordance with the laws of Australia, New Zealand, and Sri Lanka (depending on the serving branch). Any legal action or dispute arising from these terms will be handled in corresponding local courts.",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C] relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#04a891]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        {/* Hero header */}
        <section className="pt-36 pb-16 relative z-10">
          <div className="max-w-[800px] mx-auto px-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#04a891]/20 bg-[#04a891]/5 text-[#04a891] text-xs font-semibold mb-6">
              <Scale size={14} /> Service Terms
            </div>
            <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-none tracking-tight mb-5">
              Terms of Service
            </h1>
            <p className="text-white/50 text-base max-w-[540px] mx-auto">
              Please read these terms carefully before using our platform or recruitment services. By using the site, you agree to these guidelines.
            </p>
          </div>
        </section>

        {/* Content body */}
        <section className="pb-32 relative z-10">
          <div className="max-w-[720px] mx-auto px-5">
            <div className="space-y-6">
              {sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 bg-white/3 border border-white/8 rounded-[20px] backdrop-blur-xl transition-all duration-300 hover:border-[#04a891]/35 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-9 h-9 rounded-[10px] bg-[#02695e]/25 border border-[#04a891]/25 flex items-center justify-center text-[#04a891]">
                        <Icon size={18} />
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-wide">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed pl-12">
                      {section.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 rounded-[16px] border border-white/5 bg-[#111413] text-center">
              <p className="text-xs text-white/40">
                Last updated: June 8, 2026. If you have any inquiries regarding our Terms of Service, please contact us at <a href="mailto:hello@headhunters.com.au" className="text-[#04a891] hover:underline font-semibold">hello@headhunters.com.au</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
