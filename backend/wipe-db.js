const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function main() {
  if (process.env.WIPE_DATABASE_CONFIRM !== 'WIPE_MYSQL_DATABASE') {
    throw new Error('Refusing to wipe database. Set WIPE_DATABASE_CONFIRM=WIPE_MYSQL_DATABASE to continue.');
  }

  const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    throw new Error('Set DATABASE_MIGRATION_URL or DATABASE_URL to a mysql:// connection string before wiping MySQL.');
  }

  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 1,
    timezone: 'Z',
    charset: 'utf8mb4',
  });

  try {
    const [databaseRows] = await pool.query('SELECT DATABASE() AS databaseName');
    const databaseName = Array.isArray(databaseRows) && databaseRows[0] && databaseRows[0].databaseName;
    if (!databaseName) {
      throw new Error('Could not determine selected MySQL database.');
    }

    const [tables] = await pool.query(
      'SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()'
    );

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const row of tables) {
      await pool.query(`DROP TABLE IF EXISTS \`${String(row.tableName).replace(/`/g, '``')}\``);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`Database wiped successfully: ${databaseName}`);
  } catch (err) {
    console.error('Wipe failed:', err);
  } finally {
    await pool.end();
  }
}

main();
