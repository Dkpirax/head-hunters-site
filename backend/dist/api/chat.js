"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const cuid2_1 = require("@paralleldrive/cuid2");
exports.chatRouter = (0, express_1.Router)();
// Get or Create Conversation — only returns ACTIVE (BOT_ACTIVE or HUMAN_ACTIVE) conversations.
// If the existing conversation is CLOSED, creates a new one.
exports.chatRouter.post('/conversations', async (req, res) => {
    try {
        const { visitorId } = req.body;
        if (!visitorId)
            return res.status(400).json({ error: 'visitorId required' });
        // ONLY look for non-closed conversations
        const existingConvs = await db_1.db.select()
            .from(schema_1.conversation)
            .where((0, drizzle_orm_1.eq)(schema_1.conversation.userId, visitorId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.conversation.updatedAt))
            .limit(1);
        const existingConv = existingConvs[0];
        // If found and NOT closed, return it with messages
        if (existingConv && existingConv.status !== 'CLOSED') {
            const messages = await db_1.db.select()
                .from(schema_1.message)
                .where((0, drizzle_orm_1.eq)(schema_1.message.conversationId, existingConv.id))
                .orderBy(schema_1.message.createdAt);
            return res.json({
                ...existingConv,
                messages,
            });
        }
        // Otherwise create a fresh conversation
        const settings = await db_1.db.select()
            .from(schema_1.content)
            .where((0, drizzle_orm_1.eq)(schema_1.content.key, 'chatbot_greeting'))
            .limit(1);
        const greetingText = settings[0]?.value || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
        const { newConv, botGreeting } = await db_1.db.transaction(async (tx) => {
            const conversationId = (0, cuid2_1.createId)();
            const greetingId = (0, cuid2_1.createId)();
            await tx.insert(schema_1.conversation).values({
                id: conversationId,
                userId: visitorId,
                status: 'BOT_ACTIVE',
            });
            await tx.insert(schema_1.message).values({
                id: greetingId,
                conversationId,
                senderType: 'BOT',
                content: greetingText,
            });
            const [createdConversation] = await tx.select()
                .from(schema_1.conversation)
                .where((0, drizzle_orm_1.eq)(schema_1.conversation.id, conversationId))
                .limit(1);
            const [createdGreeting] = await tx.select()
                .from(schema_1.message)
                .where((0, drizzle_orm_1.eq)(schema_1.message.id, greetingId))
                .limit(1);
            return { newConv: createdConversation, botGreeting: createdGreeting };
        });
        return res.json({
            ...newConv,
            messages: [botGreeting]
        });
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
        const newMsg = await db_1.db.transaction(async (tx) => {
            const messageId = (0, cuid2_1.createId)();
            await tx.insert(schema_1.message).values({
                id: messageId,
                conversationId: id,
                senderType,
                content,
            });
            await tx.update(schema_1.conversation).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id));
            const [createdMessage] = await tx.select()
                .from(schema_1.message)
                .where((0, drizzle_orm_1.eq)(schema_1.message.id, messageId))
                .limit(1);
            return createdMessage;
        });
        return res.json(newMsg);
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
