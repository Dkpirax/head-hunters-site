import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

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
    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
    });

    jobRoutes = jobs.map((job) => ({
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
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    articleRoutes = articles.map((article) => ({
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
