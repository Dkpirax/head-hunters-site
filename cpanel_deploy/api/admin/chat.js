"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Get active conversations list
router.get("/active_list", async (req, res) => {
    try {
        const list = await db_1.db.query.conversation.findMany({
            where: (0, drizzle_orm_1.inArray)(schema_1.conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"]),
            with: {
                messages: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema_1.message.createdAt)],
                },
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.conversation.updatedAt)],
        });
        res.json(list);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});
// Get messages for a session
router.get("/sessions/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const convs = await db_1.db.query.conversation.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.conversation.id, id),
            with: {
                messages: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema_1.message.createdAt)],
                },
            },
        });
        if (convs.length === 0) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        res.json(convs[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});
// Take over conversation
router.post("/sessions/:id/takeover", async (req, res) => {
    try {
        const { id } = req.params;
        const { adminEmail } = req.body;
        await db_1.db.update(schema_1.conversation).set({
            status: "HUMAN_ACTIVE",
            takenBy: adminEmail,
            needsHuman: false,
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        await db_1.db.insert(schema_1.message).values({
            conversationId: id,
            senderType: "BOT",
            content: "A consultant has joined the chat.",
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to take over chat" });
    }
});
// Close conversation
router.post("/sessions/:id/close", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.update(schema_1.conversation).set({
            status: "CLOSED",
            needsHuman: false,
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        await db_1.db.insert(schema_1.message).values({
            conversationId: id,
            senderType: "BOT",
            content: "Conversation resolved and closed.",
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to close chat" });
    }
});
// Pause conversation
router.post("/sessions/:id/pause", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.update(schema_1.conversation).set({
            status: "BOT_ACTIVE",
            needsHuman: false,
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        await db_1.db.insert(schema_1.message).values({
            conversationId: id,
            senderType: "BOT",
            content: "Live support paused. Bot active.",
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to pause chat" });
    }
});
// Add message
router.post("/sessions/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const { senderType, content } = req.body;
        await db_1.db.insert(schema_1.message).values({
            conversationId: id,
            senderType,
            content,
        });
        await db_1.db.update(schema_1.conversation).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        const newMsg = await db_1.db.query.message.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.message.conversationId, id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.message.createdAt)],
        });
        res.json(newMsg);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send message" });
    }
});
exports.default = router;
