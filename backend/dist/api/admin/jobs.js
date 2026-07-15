"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const jobs = await db_1.db.select().from(schema_1.job).orderBy((0, drizzle_orm_1.desc)(schema_1.job.createdAt));
        return res.json(jobs);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        await db_1.db.insert(schema_1.job).values({
            title: data.title,
            location: data.location,
            type: data.type,
            description: data.description,
            status: data.status || 'ACTIVE',
            isHot: data.isHot || false,
        });
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create job' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await db_1.db.update(schema_1.job).set({
            title: data.title,
            location: data.location,
            type: data.type,
            description: data.description,
            status: data.status,
            isHot: data.isHot,
        }).where((0, drizzle_orm_1.eq)(schema_1.job.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update job' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.job).where((0, drizzle_orm_1.eq)(schema_1.job.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete job' });
    }
});
exports.default = router;
