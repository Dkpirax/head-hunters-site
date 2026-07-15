import { db } from './src/lib/db';
import { adminUser } from './src/db/schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function seed() {
  console.log('Seeding admin user...');

  try {
    const email = 'admin@headhunters.com.au';
    const password = 'adminpassword123';
    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(password, saltRounds);

    await db.insert(adminUser).values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    });

    console.log(`Admin user created: ${email}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    process.exit(0);
  }
}

seed();
