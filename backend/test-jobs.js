require('dotenv').config({ path: '../.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const jobs = await sql`SELECT * FROM job;`;
  console.log('Jobs count:', jobs.length);
  if (jobs.length > 0) console.log(jobs[0]);
}

main().catch(console.error);
