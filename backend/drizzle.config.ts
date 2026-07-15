import { defineConfig } from 'drizzle-kit';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL || '';
const command = process.env.npm_lifecycle_event || '';
const needsDatabase = ['db:migrate', 'db:push', 'db:studio'].includes(command);

if (needsDatabase && !databaseUrl.startsWith('mysql://')) {
  throw new Error(`${command} requires DATABASE_MIGRATION_URL or DATABASE_URL to be a mysql:// connection string.`);
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: databaseUrl.startsWith('mysql://') ? databaseUrl : 'mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME',
  },
});
