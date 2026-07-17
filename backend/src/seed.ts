import { db } from './lib/db';
import { adminUser } from './db/schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding admin user...');
  const hash = await bcrypt.hash('admin', 10);
  
  await db.insert(adminUser).values({
    email: 'admin@hh.lk',
    passwordHash: hash,
    name: 'Admin',
    role: 'SUPER_ADMIN'
  });
  
  console.log('Admin user seeded successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
