import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
  console.log('Connected to DB');

  try {
    // We are migrating the Candidate table. We will ignore errors if columns don't exist/already exist
    await connection.query('ALTER TABLE Candidate DROP COLUMN dateOfBirth').catch(() => console.log('dateOfBirth already dropped'));
    await connection.query('ALTER TABLE Candidate DROP COLUMN parentalConsent').catch(() => console.log('parentalConsent already dropped'));
    await connection.query('ALTER TABLE Candidate ADD COLUMN phone varchar(191)').catch(() => console.log('phone already added'));
    await connection.query('ALTER TABLE Candidate ADD COLUMN interestedJobs text').catch(() => console.log('interestedJobs already added'));
    await connection.query('ALTER TABLE Candidate ADD COLUMN cvFileName varchar(191)').catch(() => console.log('cvFileName already added'));
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
