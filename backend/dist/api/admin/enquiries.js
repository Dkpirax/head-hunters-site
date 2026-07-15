"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminEnquiriesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
exports.adminEnquiriesRouter = (0, express_1.Router)();
exports.adminEnquiriesRouter.use(auth_1.requireAuth);
exports.adminEnquiriesRouter.get('/', async (req, res) => {
    try {
        const enquiries = await db_1.db.select().from(schema_1.enquiry).orderBy((0, drizzle_orm_1.desc)(schema_1.enquiry.createdAt));
        return res.json(enquiries);
    }
    catch (error) {
        console.error('Failed to fetch enquiries:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminEnquiriesRouter.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        await db_1.db.update(schema_1.enquiry).set({ status }).where((0, drizzle_orm_1.eq)(schema_1.enquiry.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to update enquiry status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminEnquiriesRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.enquiry).where((0, drizzle_orm_1.eq)(schema_1.enquiry.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to delete enquiry:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
