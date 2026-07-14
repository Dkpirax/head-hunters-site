import { db } from "@/lib/db";
import { permission, userPermission, adminUser } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    .select({
      name: permission.name
    })
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
  if (!permissionsSeeded) {
    await seedPermissions();
    permissionsSeeded = true;
  }

  const session = await auth();
  if (!session?.user?.email) return false;

  const users = await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase()));
  let user = users[0];

  if (!user) {
    const allUsers = await db.select({ id: adminUser.id }).from(adminUser);
    const adminCount = allUsers.length;
    if (adminCount === 0) {
      const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
      const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      const existingFallback = await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail));
      if (existingFallback.length === 0) {
        await db.insert(adminUser).values({
          email: fallbackEmail,
          passwordHash,
          name: "Head Hunters Admin",
          role: "SUPER_ADMIN",
        });
      }
      user = (await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail)))[0];

      if (session.user.email.toLowerCase() !== fallbackEmail) {
        await db.insert(adminUser).values({
          email: session.user.email.toLowerCase(),
          passwordHash,
          name: session.user.name || "Session Admin",
          role: "SUPER_ADMIN",
        });
        user = (await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase())))[0];
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

  const users = await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase()));
  let user = users[0];

  if (!user) {
    const allUsers = await db.select({ id: adminUser.id }).from(adminUser);
    const adminCount = allUsers.length;
    if (adminCount === 0) {
      const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
      const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      const existingFallback = await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail));
      if (existingFallback.length === 0) {
        await db.insert(adminUser).values({
          email: fallbackEmail,
          passwordHash,
          name: "Head Hunters Admin",
          role: "SUPER_ADMIN",
        });
      }
      user = (await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail)))[0];

      if (session.user.email.toLowerCase() !== fallbackEmail) {
        await db.insert(adminUser).values({
          email: session.user.email.toLowerCase(),
          passwordHash,
          name: session.user.name || "Session Admin",
          role: "SUPER_ADMIN",
        });
        user = (await db.select().from(adminUser).where(eq(adminUser.email, session.user.email.toLowerCase())))[0];
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
