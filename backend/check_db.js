const mysql = require('mysql2/promise');
require('dotenv').config({path: '../.env'});

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    throw new Error('Set DATABASE_URL to a mysql:// connection string before checking MySQL.');
  }

  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 1,
    timezone: 'Z',
    charset: 'utf8mb4',
  });

  try {
    const [rows] = await pool.query('SELECT email FROM `AdminUser`');
    console.log(rows);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
