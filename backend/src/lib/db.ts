import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import dotenv from "dotenv";
import path from "path";

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create and export the drizzle instance
export const db = drizzle(pool, { schema });
