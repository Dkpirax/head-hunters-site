const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    throw new Error('Set DATABASE_URL to a mysql:// connection string before testing MySQL.');
  }

  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 1,
    timezone: 'Z',
    charset: 'utf8mb4',
  });

  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    console.log('Connection successful:', rows);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Connection error:', error.message);
  process.exit(1);
});
