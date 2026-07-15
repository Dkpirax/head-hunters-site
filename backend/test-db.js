const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_DIRECT_URL,
  connectionTimeoutMillis: 5000,
});

pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connection successful:', res.rows);
  }
  pool.end();
});
