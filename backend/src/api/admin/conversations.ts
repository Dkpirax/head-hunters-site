import { Router } from 'express';
import { db } from '../../lib/db';
import { conversation, message } from '../../db/schema';
import { eq, inArray, desc, asc } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';
import crypto from "crypto";

export const adminConversationsRouter = Router();

adminConversationsRouter.use(requireAuth);

adminConversationsRouter.get('/', async (req, res) => {
  try {
    const convs = await db.select()
      .from(conversation)
      .where(inArray(conversation.status, ['BOT_ACTIVE', 'HUMAN_ACTIVE']))
      .orderBy(desc(conversation.updatedAt));

    const convIds = convs.map(c => c.id);
    const allMessages = convIds.length > 0 
      ? await db.select().from(message).where(inArray(message.conversationId, convIds)).orderBy(asc(message.createdAt))
      : [];

    const formattedConvs = convs.map(c => ({
      ...c,
      messages: allMessages.filter(m => m.conversationId === c.id)
    }));

    return res.json(formattedConvs);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminConversationsRouter.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const [conv] = await db.select().from(conversation).where(eq(conversation.id, id)).limit(1);
    
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const msgs = await db.select().from(message).where(eq(message.conversationId, id)).orderBy(asc(message.createdAt));
    
    return res.json({ ...conv, messages: msgs });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminConversationsRouter.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, senderType } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const newMsg = await db.transaction(async (tx) => {
      const messageId = crypto.randomUUID();
      await tx.insert(message).values({
        id: messageId,
        conversationId: id,
        content,
        senderType: senderType || 'ADMIN',
      });

      await tx.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, id));

      const [createdMessage] = await tx.select()
        .from(message)
        .where(eq(message.id, messageId))
        .limit(1);

      return createdMessage;
    });
    
    return res.json(newMsg);
  } catch (error) {
    console.error('Failed to add message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminConversationsRouter.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, takenBy, needsHuman } = req.body;
    
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'HUMAN_ACTIVE') {
        updateData.chatStatus = 'ADMIN_JOINED';
      } else if (status === 'BOT_ACTIVE' || status === 'CLOSED') {
        updateData.chatStatus = 'OPEN';
        updateData.mode = 'AI';
      }
    }
    if (takenBy !== undefined) updateData.takenBy = takenBy;
    if (needsHuman !== undefined) updateData.needsHuman = needsHuman;
    
    await db.update(conversation).set(updateData).where(eq(conversation.id, id));
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
