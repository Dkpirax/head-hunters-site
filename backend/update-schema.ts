import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE conversation ADD COLUMN humanSupportProvider varchar(191) DEFAULT 'INTERNAL'`);
    console.log("Added humanSupportProvider");
  } catch (e: any) {
    console.log(e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE conversation ADD COLUMN handoffRequestedAt datetime`);
    console.log("Added handoffRequestedAt");
  } catch (e: any) {
    console.log(e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE conversation ADD COLUMN tawkOpenedAt datetime`);
    console.log("Added tawkOpenedAt");
  } catch (e: any) {
    console.log(e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE conversation ADD COLUMN agentJoinedAt datetime`);
    console.log("Added agentJoinedAt");
  } catch (e: any) {
    console.log(e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE conversation ADD COLUMN handoffCompletedAt datetime`);
    console.log("Added handoffCompletedAt");
  } catch (e: any) {
    console.log(e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE conversation ADD COLUMN handoffFailureReason text`);
    console.log("Added handoffFailureReason");
  } catch (e: any) {
    console.log(e.message);
  }
  
  process.exit(0);
}

main();
