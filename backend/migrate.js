const { drizzle } = require('drizzle-orm/mysql2');
const { migrate } = require('drizzle-orm/mysql2/migrator');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function main() {
  const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    throw new Error('Set DATABASE_MIGRATION_URL or DATABASE_URL to a mysql:// connection string before migrating.');
  }

  console.log('Running MySQL migrations...');
  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 1,
    timezone: 'Z',
    charset: 'utf8mb4',
  });

  const db = drizzle(pool, { mode: 'default' });

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
