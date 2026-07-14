"use server";

import { db } from "@/lib/db";
import { article } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getArticles() {
  return await db.select().from(article).orderBy(desc(article.createdAt));
}

export async function getArticleBySlug(slug: string) {
  const articles = await db.select().from(article).where(eq(article.slug, slug));
  return articles[0] || null;
}

export async function createArticle(data: {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
}) {
  await db.insert(article).values(data);
  const result = data;
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  return result;
}

export async function updateArticle(
  id: string,
  data: {
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    isPublished: boolean;
  }
) {
  await db.update(article).set(data).where(eq(article.id, id));
  const result = { id, ...data };
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  revalidatePath(`/insights/${data.slug}`);
  return result;
}

export async function deleteArticle(id: string) {
  await db.delete(article).where(eq(article.id, id));
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
}
