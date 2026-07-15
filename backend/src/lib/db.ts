import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import dotenv from "dotenv";
import path from "path";

import fs from 'fs';

const envPaths = [
  path.join(__dirname, '.env'),                 // if built to a single file at root
  path.join(__dirname, '../.env'),              // if in lib/ and .env at root
  path.join(__dirname, '../../.env'),           // if in src/lib/ and .env at backend/
  path.join(__dirname, '../../../.env')         // if in src/lib/ and .env at project root
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  dotenv.config(); // fallback
}

// Create the connection pool
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

// Create and export the drizzle instance
export const db = drizzle(poolConnection, { schema, mode: "default" });
