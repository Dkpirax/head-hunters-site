import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Eye, Database, FileText, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy regarding how we handle, collect, and protect your personal information and CV details.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: Eye,
      text: "We collect personal information necessary to provide professional recruitment and workforce services. This includes names, contact details (email and phone), work history, qualifications, resume documents (CVs), and any other details you supply during registrations or applications.",
    },
    {
      title: "2. How We Use Your Information",
      icon: UserCheck,
      text: "Your information is used solely to match candidates with potential job vacancies, respond to hiring client enquiries, provide workforce management support, and improve the recruitment experience. We only share candidate details with potential employers with explicit candidate consent.",
    },
    {
      title: "3. Data Security & Storage",
      icon: Database,
      text: "We implement robust security measures including end-to-end encryption, regular system updates, and strict database access controls. Personal data is securely stored in environments guarded against unauthorized access, modification, or disclosure.",
    },
    {
      title: "4. Your Rights & Data Deletion",
      icon: ShieldCheck,
      text: "Under privacy regulations (including GDPR where applicable), you have the right to access, update, correct, or request deletion of your personal data. To request data removal, please contact our support team at hello@headhunters.com.au.",
    },
    {
      title: "5. Cookies & Site Tracking",
      icon: FileText,
      text: "We use essential cookies to maintain secure sessions (such as admin logins) and non-essential cookies to analyze traffic patterns. You can manage your preferences through our cookie consent interface or your browser settings.",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C] relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#04a891]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Hero header */}
        <section className="pt-36 pb-16 relative z-10">
          <div className="max-w-[800px] mx-auto px-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#04a891]/20 bg-[#04a891]/5 text-[#04a891] text-xs font-semibold mb-6">
              <ShieldCheck size={14} /> Trust & Transparency
            </div>
            <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-none tracking-tight mb-5">
              Privacy Policy
            </h1>
            <p className="text-white/50 text-base max-w-[540px] mx-auto">
              Your trust is our priority. Learn how we handle, protect, and respect your personal information and application documents.
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
                Last updated: June 8, 2026. For questions regarding this policy, please reach out to <a href="mailto:hello@headhunters.com.au" className="text-[#04a891] hover:underline font-semibold">hello@headhunters.com.au</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
