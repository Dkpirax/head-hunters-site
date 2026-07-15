import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { job as jobsTable, article as articleTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://headhunters.com.au";

  // Static routes
  const staticRoutes = ["", "/jobs", "/insights", "/privacy", "/terms"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic jobs
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobs = await db
      .select({ id: jobsTable.id, updatedAt: jobsTable.updatedAt })
      .from(jobsTable)
      .where(eq(jobsTable.status, "ACTIVE"));

    jobRoutes = jobs.map((job: any) => ({
      url: `${siteUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to generate sitemap job routes:", error);
  }

  // Dynamic insights/articles
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await db
      .select({ slug: articleTable.slug, updatedAt: articleTable.updatedAt })
      .from(articleTable)
      .where(eq(articleTable.isPublished, true));

    articleRoutes = articles.map((article: any) => ({
      url: `${siteUrl}/insights/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to generate sitemap article routes:", error);
  }

  return [...staticRoutes, ...jobRoutes, ...articleRoutes];
}
