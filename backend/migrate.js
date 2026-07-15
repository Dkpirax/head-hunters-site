const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

async function main() {
  console.log('Running migrations...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_DIRECT_URL,
    connectionTimeoutMillis: 10000,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

main();
