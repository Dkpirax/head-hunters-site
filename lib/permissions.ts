import { db } from "./db";
import { adminUser, permission, userPermission } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
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
      const existing = await db.select().from(permission).where(eq(permission.name, name));
      if (existing.length === 0) {
        await db.insert(permission).values({ name });
      }
    }
  } catch (error) {
    console.error("Failed to seed permissions:", error);
  }
}

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const userPerms = await db
    .select({ name: permission.name })
    .from(userPermission)
    .innerJoin(permission, eq(userPermission.permissionId, permission.id))
    .where(eq(userPermission.userId, userId));

  return new Set(userPerms.map((up) => up.name));
}

export async function hasPermission(userId: string, perm: string): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.has(perm);
}

export async function checkPermission(perm: string): Promise<boolean> {
  await seedPermissions();

  const session = await auth();
  if (!session?.user?.email) return false;

  const users = await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase()));
  let user = users[0];

  if (!user) {
    const adminCountRes = await db.select({ count: sql<number>\`count(*)\` }).from(adminUser);
    if (adminCountRes[0].count === 0) {
      const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
      const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      await db.insert(adminUser).values({
        email: fallbackEmail,
        passwordHash,
        name: "Head Hunters Admin",
        role: "SUPER_ADMIN",
      });
      const fallbackAdmins = await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail));
      const fallbackAdmin = fallbackAdmins[0];

      if (session.user.email.toLowerCase() === fallbackEmail) {
        user = fallbackAdmin;
      } else {
        await db.insert(adminUser).values({
          email: session.user.email.toLowerCase(),
          passwordHash,
          name: session.user.name || "Session Admin",
          role: "SUPER_ADMIN",
        });
        const sessionAdmins = await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase()));
        user = sessionAdmins[0];
      }
    } else {
      return false;
    }
  }

  if (user.role === "SUPER_ADMIN") return true;

  return await hasPermission(user.id, perm);
}

export async function requirePermission(perm: string) {
  // Ensure default permissions are seeded in database
  await seedPermissions();

  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const users = await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase()));
  let user = users[0];

  if (!user) {
    const adminCountRes = await db.select({ count: sql<number>\`count(*)\` }).from(adminUser);
    if (adminCountRes[0].count === 0) {
      const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
      const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      await db.insert(adminUser).values({
        email: fallbackEmail,
        passwordHash,
        name: "Head Hunters Admin",
        role: "SUPER_ADMIN",
      });
      const fallbackAdmins = await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail));
      const fallbackAdmin = fallbackAdmins[0];

      if (session.user.email.toLowerCase() === fallbackEmail) {
        user = fallbackAdmin;
      } else {
        await db.insert(adminUser).values({
          email: session.user.email.toLowerCase(),
          passwordHash,
          name: session.user.name || "Session Admin",
          role: "SUPER_ADMIN",
        });
        const sessionAdmins = await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase()));
        user = sessionAdmins[0];
      }
    } else {
      throw new Error("User not found");
    }
  }

  // SUPER_ADMIN has global privileges
  if (user.role === "SUPER_ADMIN") return true;

  const has = await hasPermission(user.id, perm);
  if (!has) throw new Error(`Forbidden: missing ${perm}`);

  return true;
}
