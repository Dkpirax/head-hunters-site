"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminConversationsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
exports.adminConversationsRouter = (0, express_1.Router)();
exports.adminConversationsRouter.use(auth_1.requireAuth);
exports.adminConversationsRouter.get('/', async (req, res) => {
    try {
        const convs = await db_1.db.select()
            .from(schema_1.conversation)
            .where((0, drizzle_orm_1.inArray)(schema_1.conversation.status, ['BOT_ACTIVE', 'HUMAN_ACTIVE']))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.conversation.updatedAt));
        const convIds = convs.map(c => c.id);
        const allMessages = convIds.length > 0
            ? await db_1.db.select().from(schema_1.message).where((0, drizzle_orm_1.inArray)(schema_1.message.conversationId, convIds)).orderBy((0, drizzle_orm_1.asc)(schema_1.message.createdAt))
            : [];
        const formattedConvs = convs.map(c => ({
            ...c,
            messages: allMessages.filter(m => m.conversationId === c.id)
        }));
        return res.json(formattedConvs);
    }
    catch (error) {
        console.error('Failed to fetch conversations:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminConversationsRouter.get('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, id)).limit(1);
        if (!conv) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        const msgs = await db_1.db.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.conversationId, id)).orderBy((0, drizzle_orm_1.asc)(schema_1.message.createdAt));
        return res.json({ ...conv, messages: msgs });
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
        const newMsg = await db_1.db.transaction(async (tx) => {
            const messageId = crypto_1.default.randomUUID();
            await tx.insert(schema_1.message).values({
                id: messageId,
                conversationId: id,
                content,
                senderType: senderType || 'ADMIN',
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
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminConversationsRouter.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, takenBy, needsHuman } = req.body;
        const updateData = { updatedAt: new Date() };
        if (status !== undefined) {
            updateData.status = status;
            if (status === 'HUMAN_ACTIVE') {
                updateData.chatStatus = 'ADMIN_JOINED';
            }
            else if (status === 'BOT_ACTIVE' || status === 'CLOSED') {
                updateData.chatStatus = 'OPEN';
                updateData.mode = 'AI';
            }
        }
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
