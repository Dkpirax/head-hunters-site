import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import dotenv from "dotenv";
import path from "path";

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for MySQL connection");
}

const sslEnabled = process.env.DATABASE_SSL === "true" || process.env.MYSQL_SSL === "true";

// Create one shared MySQL pool for the process.
const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: Number(process.env.DATABASE_POOL_LIMIT || 10),
  timezone: "Z",
  charset: "utf8mb4",
  ssl: sslEnabled
    ? {
        rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
      }
    : undefined,
});

export const db = drizzle(pool, { schema, mode: "default" });
export { pool };
