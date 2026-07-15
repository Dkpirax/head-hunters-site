"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Get all enquiries
router.get("/", async (req, res) => {
    try {
        const enquiries = await db_1.db.select().from(schema_1.enquiry).orderBy((0, drizzle_orm_1.desc)(schema_1.enquiry.createdAt));
        res.json(enquiries);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch enquiries" });
    }
});
// Update enquiry status
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db_1.db.update(schema_1.enquiry).set({ status }).where((0, drizzle_orm_1.eq)(schema_1.enquiry.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update enquiry status" });
    }
});
// Delete an enquiry
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.enquiry).where((0, drizzle_orm_1.eq)(schema_1.enquiry.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete enquiry" });
    }
});
exports.default = router;
