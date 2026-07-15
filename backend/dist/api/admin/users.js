"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUsersRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.adminUsersRouter = (0, express_1.Router)();
exports.adminUsersRouter.use(auth_1.requireAuth);
exports.adminUsersRouter.get('/', async (req, res) => {
    try {
        const users = await db_1.db.query.adminUser.findMany({
            orderBy: (adminUser, { desc }) => [desc(adminUser.createdAt)],
            with: {
                permissions: {
                    with: {
                        permission: true
                    }
                }
            }
        });
        const allPermissions = await db_1.db.select().from(schema_1.permission);
        // Format like old actions
        const formattedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            createdAt: u.createdAt,
            permissions: u.permissions.map(p => p.permission.name)
        }));
        return res.json({
            users: formattedUsers,
            permissions: allPermissions.map(p => p.name),
            currentUserEmail: req.user.email
        });
    }
    catch (error) {
        console.error('Failed to fetch users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminUsersRouter.post('/', async (req, res) => {
    try {
        const { email, name, role, password, permissions } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const existing = await db_1.db.select().from(schema_1.adminUser).where((0, drizzle_orm_1.eq)(schema_1.adminUser.email, email)).limit(1);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await db_1.db.insert(schema_1.adminUser).values({
            email,
            name,
            role,
            passwordHash: hashedPassword,
        }).returning();
        // Assign permissions
        if (permissions && permissions.length > 0 && role !== 'SUPER_ADMIN') {
            const allPerms = await db_1.db.select().from(schema_1.permission);
            const permMap = Object.fromEntries(allPerms.map(p => [p.name, p.id]));
            const insertData = permissions.map((pName) => ({
                userId: newUser[0].id,
                permissionId: permMap[pName]
            })).filter((p) => p.permissionId);
            if (insertData.length > 0) {
                await db_1.db.insert(schema_1.userPermission).values(insertData);
            }
        }
        return res.json(newUser[0]);
    }
    catch (error) {
        console.error('Failed to create user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminUsersRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, role, password, permissions } = req.body;
        if (email) {
            const existing = await db_1.db.select().from(schema_1.adminUser).where((0, drizzle_orm_1.eq)(schema_1.adminUser.email, email)).limit(1);
            if (existing.length > 0 && existing[0].id !== id) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }
        const updateData = { updatedAt: new Date() };
        if (email !== undefined)
            updateData.email = email;
        if (name !== undefined)
            updateData.name = name;
        if (role !== undefined)
            updateData.role = role;
        if (password)
            updateData.passwordHash = await bcryptjs_1.default.hash(password, 10);
        await db_1.db.update(schema_1.adminUser).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.adminUser.id, id));
        // Update permissions
        if (role !== 'SUPER_ADMIN' && permissions) {
            await db_1.db.delete(schema_1.userPermission).where((0, drizzle_orm_1.eq)(schema_1.userPermission.userId, id));
            const allPerms = await db_1.db.select().from(schema_1.permission);
            const permMap = Object.fromEntries(allPerms.map(p => [p.name, p.id]));
            const insertData = permissions.map((pName) => ({
                userId: id,
                permissionId: permMap[pName]
            })).filter((p) => p.permissionId);
            if (insertData.length > 0) {
                await db_1.db.insert(schema_1.userPermission).values(insertData);
            }
        }
        else if (role === 'SUPER_ADMIN') {
            await db_1.db.delete(schema_1.userPermission).where((0, drizzle_orm_1.eq)(schema_1.userPermission.userId, id));
        }
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to update user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminUsersRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.userPermission).where((0, drizzle_orm_1.eq)(schema_1.userPermission.userId, id));
        await db_1.db.delete(schema_1.adminUser).where((0, drizzle_orm_1.eq)(schema_1.adminUser.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to delete user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminUsersRouter.post('/:id/reset', async (req, res) => {
    // Mock sending reset email
    return res.json({ success: true });
});
