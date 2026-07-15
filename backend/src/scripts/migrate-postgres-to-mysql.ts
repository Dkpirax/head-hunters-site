import dotenv from "dotenv";
import path from "path";
import { Pool as PgPool } from "pg";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

type TableSpec = {
  name: string;
  primaryKey: string[];
  columns: string[];
};

const tables: TableSpec[] = [
  {
    name: "AdminUser",
    primaryKey: ["id"],
    columns: ["id", "email", "passwordHash", "name", "role", "createdAt", "updatedAt"],
  },
  {
    name: "Permission",
    primaryKey: ["id"],
    columns: ["id", "name", "description"],
  },
  {
    name: "UserPermission",
    primaryKey: ["userId", "permissionId"],
    columns: ["userId", "permissionId"],
  },
  {
    name: "Candidate",
    primaryKey: ["id"],
    columns: ["id", "email", "name", "dateOfBirth", "parentalConsent", "createdAt", "updatedAt"],
  },
  {
    name: "Employer",
    primaryKey: ["id"],
    columns: ["id", "email", "name", "dateOfBirth", "parentalConsent", "createdAt", "updatedAt"],
  },
  {
    name: "Job",
    primaryKey: ["id"],
    columns: ["id", "title", "location", "type", "description", "status", "isHot", "createdAt", "updatedAt"],
  },
  {
    name: "Article",
    primaryKey: ["id"],
    columns: ["id", "title", "slug", "category", "excerpt", "content", "isPublished", "createdAt", "updatedAt"],
  },
  {
    name: "Content",
    primaryKey: ["id"],
    columns: ["id", "key", "value", "updatedAt"],
  },
  {
    name: "Enquiry",
    primaryKey: ["id"],
    columns: ["id", "name", "email", "phone", "type", "message", "status", "createdAt", "updatedAt"],
  },
  {
    name: "Conversation",
    primaryKey: ["id"],
    columns: ["id", "userId", "status", "takenBy", "needsHuman", "createdAt", "updatedAt"],
  },
  {
    name: "Message",
    primaryKey: ["id"],
    columns: ["id", "conversationId", "senderType", "content", "createdAt", "isReadByAdmin"],
  },
  {
    name: "PasswordResetToken",
    primaryKey: ["token"],
    columns: ["token", "email", "expires", "createdAt"],
  },
];

function quotePgIdentifier(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function quoteMysqlIdentifier(value: string) {
  return `\`${value.replace(/`/g, "``")}\``;
}

function normalizeValue(value: unknown) {
  if (value instanceof Date) {
    return value;
  }
  return value;
}

async function main() {
  const postgresUrl = process.env.POSTGRES_SOURCE_URL;
  const mysqlUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;

  if (!postgresUrl || !postgresUrl.startsWith("postgres")) {
    throw new Error("Set POSTGRES_SOURCE_URL to the Neon/PostgreSQL connection string before data migration.");
  }

  if (!mysqlUrl || !mysqlUrl.startsWith("mysql://")) {
    throw new Error("Set DATABASE_MIGRATION_URL or DATABASE_URL to a mysql:// connection string before data migration.");
  }

  const pg = new PgPool({ connectionString: postgresUrl });
  const mysqlPool = mysql.createPool({
    uri: mysqlUrl,
    waitForConnections: true,
    connectionLimit: 1,
    timezone: "Z",
    charset: "utf8mb4",
    ssl: process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" }
      : undefined,
  });

  const results: Record<string, { source: number; destinationBefore: number; insertedOrUpdated: number; destinationAfter: number }> = {};

  try {
    await mysqlPool.query("SET time_zone = '+00:00'");
    await mysqlPool.query("START TRANSACTION");

    for (const table of tables) {
      const pgColumns = table.columns.map(quotePgIdentifier).join(", ");
      const sourceResult = await pg.query(
        `SELECT ${pgColumns} FROM ${quotePgIdentifier("public")}.${quotePgIdentifier(table.name)}`
      );

      const [[beforeCountRow]] = await mysqlPool.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM ${quoteMysqlIdentifier(table.name)}`
      );

      let insertedOrUpdated = 0;
      if (sourceResult.rows.length > 0) {
        const mysqlColumns = table.columns.map(quoteMysqlIdentifier).join(", ");
        const placeholders = table.columns.map(() => "?").join(", ");
        const noopUpdate = table.primaryKey
          .map((column) => `${quoteMysqlIdentifier(column)} = ${quoteMysqlIdentifier(column)}`)
          .join(", ");

        for (const row of sourceResult.rows) {
          const values = table.columns.map((column) => normalizeValue(row[column]));
          await mysqlPool.query(
            `INSERT INTO ${quoteMysqlIdentifier(table.name)} (${mysqlColumns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${noopUpdate}`,
            values
          );
          insertedOrUpdated += 1;
        }
      }

      const [[afterCountRow]] = await mysqlPool.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM ${quoteMysqlIdentifier(table.name)}`
      );

      results[table.name] = {
        source: sourceResult.rowCount || 0,
        destinationBefore: Number(beforeCountRow.count),
        insertedOrUpdated,
        destinationAfter: Number(afterCountRow.count),
      };
    }

    await mysqlPool.query("COMMIT");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    await mysqlPool.query("ROLLBACK");
    throw error;
  } finally {
    await pg.end();
    await mysqlPool.end();
  }
}

main().catch((error) => {
  console.error(`Data migration failed: ${error.message}`);
  process.exit(1);
});
