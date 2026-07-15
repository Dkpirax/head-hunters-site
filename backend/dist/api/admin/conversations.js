"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminConversationsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
exports.adminConversationsRouter = (0, express_1.Router)();
exports.adminConversationsRouter.use(auth_1.requireAuth);
exports.adminConversationsRouter.get('/', async (req, res) => {
    try {
        const convs = await db_1.db.query.conversation.findMany({
            where: (conversation, { inArray }) => inArray(conversation.status, ['BOT_ACTIVE', 'HUMAN_ACTIVE']),
            with: {
                messages: {
                    orderBy: (message, { asc }) => [asc(message.createdAt)],
                },
            },
            orderBy: (conversation, { desc }) => [desc(conversation.updatedAt)],
        });
        return res.json(convs);
    }
    catch (error) {
        console.error('Failed to fetch conversations:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminConversationsRouter.get('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const conv = await db_1.db.query.conversation.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.conversation.id, id),
            with: {
                messages: {
                    orderBy: (message, { asc }) => [asc(message.createdAt)],
                },
            },
        });
        if (!conv) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        return res.json(conv);
    }
    catch (error) {
        console.error('Failed to fetch messages:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminConversationsRouter.post('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, senderType } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        const newMsg = await db_1.db.insert(schema_1.message).values({
            conversationId: id,
            content,
            senderType: senderType || 'ADMIN',
        }).returning();
        await db_1.db.update(schema_1.conversation).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        return res.json(newMsg[0]);
    }
    catch (error) {
        console.error('Failed to add message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminConversationsRouter.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, takenBy, needsHuman } = req.body;
        const updateData = { updatedAt: new Date() };
        if (status !== undefined)
            updateData.status = status;
        if (takenBy !== undefined)
            updateData.takenBy = takenBy;
        if (needsHuman !== undefined)
            updateData.needsHuman = needsHuman;
        await db_1.db.update(schema_1.conversation).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to update status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
