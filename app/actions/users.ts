"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getAdminUsers() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminUser(data: {
  email: string;
  name?: string;
  role: string;
  password?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Self-protection: check email duplication
  const existing = await prisma.adminUser.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    throw new Error("User with this email already exists.");
  }

  const defaultPassword = data.password || "headhunters2026";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const newUser = await prisma.adminUser.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name || null,
      role: data.role || "ADMIN",
      passwordHash,
    },
  });

  revalidatePath("/admin/users");
  return newUser;
}

export async function updateAdminUser(
  id: string,
  data: {
    email: string;
    name?: string;
    role: string;
    password?: string;
  }
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check email conflict
  const existing = await prisma.adminUser.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing && existing.id !== id) {
    throw new Error("Email is already in use by another admin.");
  }

  const updateData: Record<string, string> = {
    email: data.email.toLowerCase(),
    name: data.name || "",
    role: data.role || "ADMIN",
  };

  if (data.password && data.password.trim() !== "") {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/users");
  return updated;
}

export async function deleteAdminUser(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Self-deletion check
  const currentUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email ?? "" },
  });
  if (currentUser && currentUser.id === id) {
    throw new Error("You cannot delete your own logged-in administrator account.");
  }

  const deleted = await prisma.adminUser.delete({
    where: { id },
  });

  revalidatePath("/admin/users");
  return deleted;
}
