const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_DIRECT_URL,
    connectionTimeoutMillis: 10000,
  });

  try {
    await pool.query('DROP SCHEMA public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO postgres;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Database wiped successfully.');
  } catch (err) {
    console.error('Wipe failed:', err);
  } finally {
    await pool.end();
  }
}

main();
