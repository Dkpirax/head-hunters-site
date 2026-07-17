"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../../.env') });
async function main() {
    const email = process.env.ADMIN_EMAIL;
    if (!email)
        return;
    const hash = await bcryptjs_1.default.hash('securepassword123', 12);
    await db_1.db.update(schema_1.adminUser)
        .set({ passwordHash: hash })
        .where((0, drizzle_orm_1.eq)(schema_1.adminUser.email, email));
    console.log('Force updated admin password to securepassword123');
    process.exit(0);
}
main().catch(console.error);
