"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJobs() {
  return await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createJob(data: {
  title: string;
  location: string;
  type: any;
  status: any;
  isHot: boolean;
  description: string;
}) {
  await prisma.job.create({
    data,
  });
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
  await prisma.job.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
}

export async function deleteJob(id: string) {
  await prisma.job.delete({
    where: { id },
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}
