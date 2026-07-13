import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema";

// Create the connection pool
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

// Create and export the drizzle instance
export const db = drizzle(poolConnection, { schema, mode: "default" });
