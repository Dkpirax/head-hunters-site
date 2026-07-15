const { Pool } = require('pg');
require('dotenv').config({path: '../.env'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT email, "passwordHash" FROM "AdminUser"').then(res => {
  console.log(res.rows);
  pool.end();
}).catch(console.error);
