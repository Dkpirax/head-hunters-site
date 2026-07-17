"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./lib/db");
const schema_1 = require("./db/schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function main() {
    console.log('Seeding admin user...');
    const hash = await bcryptjs_1.default.hash('admin', 10);
    await db_1.db.insert(schema_1.adminUser).values({
        email: 'admin@hh.lk',
        passwordHash: hash,
        name: 'Admin',
        role: 'SUPER_ADMIN'
    });
    console.log('Admin user seeded successfully!');
    process.exit(0);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
