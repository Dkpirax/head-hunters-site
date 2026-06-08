import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProofStrip } from "@/components/home/ProofStrip";
import { Standards } from "@/components/home/Standards";
import { Story } from "@/components/home/Story";
import { Testimonials } from "@/components/home/Testimonials";
import { GlobalReach } from "@/components/home/GlobalReach";
import { Hero } from "@/components/home/Hero";
import { ServicesBento } from "@/components/home/ServicesBento";
import { EmployerSection } from "@/components/home/EmployerSection";
import { JobsSection } from "@/components/home/JobsSection";
import { ContactSection } from "@/components/home/ContactSection";
import { WorkforceAnimation } from "@/components/home/WorkforceAnimation";
import { InsightsSection } from "@/components/home/InsightsSection";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Head Hunters | Premium Workforce Solutions",
  description:
    "Head Hunters brings people, precision and progress to executive search, permanent recruitment, labour hire and multi-country workforce support across Australia, New Zealand and Sri Lanka.",
};

export default async function HomePage() {
  const latestJobs = await prisma.job.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProofStrip />

        {/* Intro strip */}
        <section className="bg-[#f2f3ef] py-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-start">
              <div>
                <p className="eyebrow-dark eyebrow mb-4">People. Precision. Progress.</p>
                <h2 className="text-[clamp(30px,4.5vw,58px)] font-black text-[#111413] leading-[0.95] tracking-tight">
                  Not a job board. A complete workforce partner.
                </h2>
              </div>
              <div>
                <p className="text-[#111413]/60 text-[17px] leading-relaxed mt-2">
                  Head Hunters is designed for businesses that need a clearer hiring process, stronger shortlist quality and operational support that scales beyond one vacancy. The platform leads with service, trust and outcomes.
                </p>
                <WorkforceAnimation />
              </div>
            </div>
          </div>
        </section>

        <ServicesBento />
        <Standards />
        <EmployerSection />
        <JobsSection recentJobs={latestJobs} />
        <Story />
        <GlobalReach />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
