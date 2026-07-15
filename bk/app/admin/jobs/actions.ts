"use server";

import { db } from "@/lib/db";
import { job } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getJobs() {
  return await db.select().from(job).orderBy(desc(job.createdAt));
}

export async function createJob(data: {
  title: string;
  location: string;
  type: any;
  status: any;
  isHot: boolean;
  description: string;
}) {
  await db.insert(job).values(data);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}

export async function updateJob(
  id: string,
  data: {
    title: string;
    location: string;
    type: any;
    status: any;
    isHot: boolean;
    description: string;
  }
) {
  await db.update(job).set(data).where(eq(job.id, id));
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
}

export async function deleteJob(id: string) {
  await db.delete(job).where(eq(job.id, id));
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}
