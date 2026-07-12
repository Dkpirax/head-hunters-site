const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = "admin@headhunters.com.au";
  const password = "admin";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log("Updating existing admin password");
    await prisma.adminUser.update({
      where: { email },
      data: { passwordHash, role: "SUPER_ADMIN" }
    });
  } else {
    console.log("Creating new admin");
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name: "Admin User",
        role: "SUPER_ADMIN"
      }
    });
  }
  console.log("Successfully created/updated admin credentials.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
