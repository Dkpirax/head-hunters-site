import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

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

  console.log("Seeding permissions...");
  for (const name of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Checking for admin user...");
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    console.log("Creating default admin user...");
    const fallbackEmail = (process.env.ADMIN_EMAIL || "admin@headhunters.com.au").toLowerCase();
    const fallbackPassword = process.env.ADMIN_PASSWORD || "headhunters2024";
    const passwordHash = await bcrypt.hash(fallbackPassword, 10);

    await prisma.adminUser.create({
      data: {
        email: fallbackEmail,
        passwordHash,
        name: "Head Hunters Admin",
        role: "SUPER_ADMIN",
      }
    });

    console.log(`Default admin created: ${fallbackEmail}`);
  } else {
    console.log("Admin user already exists.");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
