"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Resend } from "resend";

// Helper function to verify the current logged-in user is a SUPER_ADMIN
async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  const admin = await prisma.adminUser.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });
  if (admin?.role !== "SUPER_ADMIN") {
    throw new Error("Insufficient permissions (SUPER_ADMIN only)");
  }
}

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
  await checkSuperAdmin();

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
  await checkSuperAdmin();

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
  await checkSuperAdmin();
  const session = await auth();

  // Self-deletion check
  const currentUser = await prisma.adminUser.findUnique({
    where: { email: session!.user!.email ?? "" },
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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendResetEmail(email: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    throw new Error("User not found.");
  }

  if (!resend) {
    throw new Error("Email service is not configured (missing RESEND_API_KEY).");
  }

  const emailFrom = process.env.EMAIL_FROM || "Head Hunters <noreply@headhunters.com.au>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await resend.emails.send({
    from: emailFrom,
    to: user.email,
    subject: "Head Hunters Admin Password Reset Request",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: #02695e; letter-spacing: -0.02em;">HEAD HUNTERS</span>
        </div>
        
        <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Password Reset Requested</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          Hello ${user.name || "Administrator"},
        </p>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          An administrator has requested a password reset for your login account on the Head Hunters portal. Please click the link below to access the general settings panel and update your credentials:
        </p>
        
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${siteUrl}/admin/settings" style="background-color: #02695e; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            Access Admin Settings
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; border-t: 1px solid #f3f4f6; pt: 16px; margin: 0;">
          If you did not request this update, please notify your system administrator immediately.
        </p>
      </div>
    `
  });

  return { success: true };
}
