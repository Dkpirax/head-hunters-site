"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/lib/db");
const schema_1 = require("./src/db/schema");
async function run() {
    try {
        const res = await db_1.db.select().from(schema_1.job);
        console.log('SUCCESS: Number of jobs =', res.length);
    }
    catch (e) {
        console.error('DB ERROR:', e);
    }
    process.exit(0);
}
run();
