import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MapPin, Briefcase, Clock, Flame, ChevronLeft } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const job = await prisma.job.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!job || job.status !== "ACTIVE") {
    return {
      title: "Job Listing Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://headhunters.com.au";
  const jobUrl = `${siteUrl}/jobs/${job.id}`;

  return {
    title: `${job.title} | Jobs at Head Hunters`,
    description: `Apply for the ${job.title} position located in ${job.location}. Learn more and submit your application with Head Hunters today.`,
    alternates: {
      canonical: jobUrl,
    },
    openGraph: {
      title: `${job.title} | Head Hunters`,
      description: `Apply for the ${job.title} position located in ${job.location}. Learn more and submit your application with Head Hunters today.`,
      url: jobUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} | Head Hunters`,
      description: `Apply for the ${job.title} position located in ${job.location}. Learn more and submit your application with Head Hunters today.`,
    },
  };
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const job = await prisma.job.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!job || job.status !== "ACTIVE") {
    notFound();
  }

  const BADGE_STYLES: Record<string, string> = {
    CASUAL: "bg-orange-500 text-white",
    REMOTE: "bg-[#02695e] text-white",
    PERMANENT: "bg-blue-600 text-white",
    EXECUTIVE: "bg-purple-600 text-white",
  };

  const mapEmploymentType = (type: string) => {
    switch (type) {
      case "PERMANENT":
        return "FULL_TIME";
      case "CASUAL":
        return "PART_TIME";
      case "REMOTE":
        return "FULL_TIME";
      case "EXECUTIVE":
        return "FULL_TIME";
      default:
        return "FULL_TIME";
    }
  };

  const getCountryCode = (loc: string) => {
    const l = loc.toLowerCase();
    if (l.includes("new zealand") || l.includes("nz")) return "NZ";
    if (l.includes("sri lanka") || l.includes("lk")) return "LK";
    return "AU";
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://headhunters.com.au";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.createdAt.toISOString(),
    "employmentType": mapEmploymentType(job.type),
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Head Hunters",
      "sameAs": siteUrl,
    },
    ...(job.type === "REMOTE"
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            "name": "Australia",
          },
        }
      : {
          jobLocation: {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location,
              "addressCountry": getCountryCode(job.location),
            },
          },
        }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="min-h-screen bg-[#0B0B0C] pt-32 pb-24">
        <div className="max-w-[800px] mx-auto px-5">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-8">
            <ChevronLeft size={16} /> Back to jobs
          </Link>

          <div className="bg-[#111413] border border-white/10 rounded-[24px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {job.isHot && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            )}
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wider ${BADGE_STYLES[job.type] || "bg-white/10 text-white"}`}>
                {job.type}
              </span>
              {job.isHot && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500">
                  <Flame size={12} /> Red Hot
                </span>
              )}
            </div>

            <h1 className="text-[clamp(32px,4vw,48px)] font-black text-white leading-tight tracking-tight mb-6">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60 mb-10 pb-10 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#04a891]" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-[#04a891]" />
                {job.type.charAt(0) + job.type.slice(1).toLowerCase()}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#04a891]" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="prose prose-invert prose-emerald max-w-none mb-12">
              {job.description ? (
                // Super simple markdown-like rendering for standard bold and lists
                <div 
                  className="space-y-4 text-white/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: job.description
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
                      .replace(/(<li>[\s\S]*<\/li>)/g, '<ul class="list-disc pl-5 my-4 space-y-2 marker:text-[#04a891]">$1</ul>')
                  }} 
                />
              ) : (
                <p className="text-white/60 italic">No detailed description available for this position.</p>
              )}
            </div>

            <div className="bg-[#0B0B0C] border border-white/5 rounded-[16px] p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Interested in this role?</h3>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                Click below to send us your details. Our recruitment team will review your application and get back to you within 48 hours.
              </p>
              <a 
                href={`mailto:apply@headhunters.com.au?subject=Application for ${job.title} (${job.id})`}
                className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#04a891] hover:bg-[#02695e] text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(4,168,145,0.3)]"
              >
                Apply Now via Email
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
