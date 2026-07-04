import { prisma } from "./prisma";
import { auth } from "./auth";
import bcrypt from "bcryptjs";

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
  return new Set(userPerms.map((up: any) => up.permission.name));
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.has(permission);
}

export async function checkPermission(permission: string): Promise<boolean> {
  await seedPermissions();

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

      const fallbackAdmin = await prisma.adminUser.create({
        data: {
          email: fallbackEmail,
          passwordHash,
          name: "Head Hunters Admin",
          role: "SUPER_ADMIN",
        },
      });

      if (session.user.email.toLowerCase() === fallbackEmail) {
        user = fallbackAdmin;
      } else {
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

  return await hasPermission(user.id, permission);
}

export async function requirePermission(permission: string) {
  // Ensure default permissions are seeded in database
  await seedPermissions();

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

      const fallbackAdmin = await prisma.adminUser.create({
        data: {
          email: fallbackEmail,
          passwordHash,
          name: "Head Hunters Admin",
          role: "SUPER_ADMIN",
        },
      });

      if (session.user.email.toLowerCase() === fallbackEmail) {
        user = fallbackAdmin;
      } else {
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

  // SUPER_ADMIN has global privileges
  if (user.role === "SUPER_ADMIN") return true;

  const has = await hasPermission(user.id, permission);
  if (!has) throw new Error(`Forbidden: missing ${permission}`);

  return true;
}
