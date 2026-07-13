"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getArticles() {
  return await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getArticleBySlug(slug: string) {
  return await prisma.article.findUnique({
    where: { slug },
  });
}

export async function createArticle(data: {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
}) {
  const result = await prisma.article.create({
    data,
  });
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
  const result = await prisma.article.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  revalidatePath(`/insights/${data.slug}`);
  return result;
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({
    where: { id },
  });
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
}
