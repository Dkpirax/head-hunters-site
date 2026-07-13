import prisma from "@/lib/prisma";
import { auth } from "./auth";
import bcrypt from "bcryptjs";

let permissionsSeeded = false;

export async function seedPermissions() {
  const defaultPermissions = [
    "manage_users",
    "manage_jobs",
    "manage_insights",
    "manage_settings",
    "manage_homepage_copy",
    "manage_section_toggles",
    "view_chat",
    "send_chat_messages",
    "view_enquiries",
    "export_data",
    "maintenance_mode_toggle",
    "manage_seo_settings",
  ];

  try {
    for (const name of defaultPermissions) {
      await prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  } catch (error) {
    console.error("Failed to seed permissions:", error);
  }
}

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const userPerms = await prisma.userPermission.findMany({
    where: { userId },
    include: { permission: true },
  });

  return new Set(userPerms.map((up) => up.permission.name));
}

export async function hasPermission(userId: string, perm: string): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.has(perm);
}

export async function checkPermission(perm: string): Promise<boolean> {
  if (!permissionsSeeded) {
    await seedPermissions();
    permissionsSeeded = true;
  }

  const session = await auth();
  if (!session?.user?.email) return false;

  let user = await prisma.adminUser.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!user) {
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
      const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      user = await prisma.adminUser.upsert({
        where: { email: fallbackEmail },
        update: {},
        create: {
          email: fallbackEmail,
          passwordHash,
          name: "Head Hunters Admin",
          role: "SUPER_ADMIN",
        },
      });

      if (session.user.email.toLowerCase() !== fallbackEmail) {
        user = await prisma.adminUser.create({
          data: {
            email: session.user.email.toLowerCase(),
            passwordHash,
            name: session.user.name || "Session Admin",
            role: "SUPER_ADMIN",
          },
        });
      }
    } else {
      return false;
    }
  }

  if (user.role === "SUPER_ADMIN") return true;

  return await hasPermission(user.id, perm);
}

export async function requirePermission(perm: string) {
  if (!permissionsSeeded) {
    await seedPermissions();
    permissionsSeeded = true;
  }

  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  let user = await prisma.adminUser.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!user) {
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
      const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      user = await prisma.adminUser.upsert({
        where: { email: fallbackEmail },
        update: {},
        create: {
          email: fallbackEmail,
          passwordHash,
          name: "Head Hunters Admin",
          role: "SUPER_ADMIN",
        },
      });

      if (session.user.email.toLowerCase() !== fallbackEmail) {
        user = await prisma.adminUser.create({
          data: {
            email: session.user.email.toLowerCase(),
            passwordHash,
            name: session.user.name || "Session Admin",
            role: "SUPER_ADMIN",
          },
        });
      }
    } else {
      throw new Error("User not found");
    }
  }

  if (user.role === "SUPER_ADMIN") return true;

  const has = await hasPermission(user.id, perm);
  if (!has) throw new Error(`Forbidden: missing ${perm}`);

  return true;
}
