"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.chatRouter = (0, express_1.Router)();
// Get or Create Conversation
exports.chatRouter.post('/conversations', async (req, res) => {
    try {
        const { visitorId } = req.body;
        if (!visitorId)
            return res.status(400).json({ error: 'visitorId required' });
        let conv = await db_1.db.query.conversation.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.conversation.userId, visitorId),
            with: {
                messages: {
                    orderBy: (message, { asc }) => [asc(message.createdAt)]
                }
            }
        });
        if (!conv) {
            const newConv = await db_1.db.insert(schema_1.conversation).values({
                userId: visitorId,
                status: 'BOT_ACTIVE',
            }).returning();
            const botGreeting = await db_1.db.insert(schema_1.message).values({
                conversationId: newConv[0].id,
                senderType: 'BOT',
                content: "Hi there! I'm the Head Hunters assistant. How can I help you today?",
            }).returning();
            return res.json({
                id: newConv[0].id,
                status: newConv[0].status,
                messages: botGreeting
            });
        }
        return res.json(conv);
    }
    catch (error) {
        console.error('Failed to get/create conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add Message
exports.chatRouter.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { senderType, content } = req.body;
        if (!content)
            return res.status(400).json({ error: 'Message content required' });
        const newMsg = await db_1.db.insert(schema_1.message).values({
            conversationId: id,
            senderType,
            content,
        }).returning();
        // Update conversation timestamp
        await db_1.db.update(schema_1.conversation).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        return res.json(newMsg[0]);
    }
    catch (error) {
        console.error('Failed to add message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Close Conversation
exports.chatRouter.post('/conversations/:id/close', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.update(schema_1.conversation).set({
            status: 'CLOSED',
            needsHuman: false,
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to close conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Request Human Takeover
exports.chatRouter.post('/conversations/:id/takeover', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.update(schema_1.conversation).set({
            needsHuman: true,
            updatedAt: new Date()
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to request human takeover:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Poll Messages
exports.chatRouter.get('/messages', async (req, res) => {
    try {
        const { conversationId } = req.query;
        if (!conversationId || typeof conversationId !== 'string') {
            return res.status(400).json({ error: 'conversationId required' });
        }
        const conv = await db_1.db.query.conversation.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.conversation.id, conversationId),
            with: {
                messages: {
                    orderBy: (message, { asc }) => [asc(message.createdAt)]
                }
            }
        });
        if (!conv) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        return res.json({
            status: conv.status,
            takenBy: conv.takenBy,
            messages: conv.messages
        });
    }
    catch (error) {
        console.error('Failed to poll messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
