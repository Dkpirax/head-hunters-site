import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";
import { JobsClient } from "./JobsClient";
import { db } from "@/lib/db";
import { job } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description: "Search and apply for roles across Australia, New Zealand and Sri Lanka — permanent, casual, remote and executive positions.",
};

export default async function JobsPage() {
  const jobs = await db
    .select()
    .from(job)
    .where(eq(job.status, "ACTIVE"))
    .orderBy(desc(job.createdAt));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C]">
        <Suspense fallback={<div className="h-screen grid place-items-center"><div className="w-8 h-8 border-2 border-[#04a891] border-t-transparent rounded-full animate-spin"/></div>}>
          <JobsClient initialJobs={jobs} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
