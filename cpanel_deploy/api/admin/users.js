"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
// Get all admin users
router.get("/", async (req, res) => {
    try {
        const users = await db_1.db.select().from(schema_1.adminUser);
        // In a real app we'd fetch permissions too, but to keep it simple we'll just return users
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// Create a new admin user
router.post("/", async (req, res) => {
    try {
        const { email, name, role, password } = req.body;
        const passwordHash = await bcryptjs_1.default.hash(password || "password123", 12);
        const [id] = await db_1.db.insert(schema_1.adminUser).values({
            email,
            name,
            role,
            passwordHash,
        }).$returningId();
        const created = await db_1.db.query.adminUser.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.adminUser.id, id.id)
        });
        res.json(created);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create user" });
    }
});
// Update an admin user
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, role, password } = req.body;
        const updateData = {
            email,
            name,
            role,
            updatedAt: new Date(),
        };
        if (password) {
            updateData.passwordHash = await bcryptjs_1.default.hash(password, 12);
        }
        await db_1.db.update(schema_1.adminUser).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.adminUser.id, id));
        const updated = await db_1.db.query.adminUser.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.adminUser.id, id)
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update user" });
    }
});
// Delete an admin user
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.adminUser).where((0, drizzle_orm_1.eq)(schema_1.adminUser.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});
// Reset password email (mock)
router.post("/:id/reset-password", async (req, res) => {
    try {
        // In a real implementation this would generate a token and send an email
        res.json({ success: true, message: "Reset email sent" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send reset email" });
    }
});
exports.default = router;
