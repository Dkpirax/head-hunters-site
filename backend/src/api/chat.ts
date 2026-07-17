import { Router } from 'express';
import { db } from '../lib/db';
import { conversation, message, content } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from "crypto";

export const chatRouter = Router();

// Get or Create Conversation — only returns ACTIVE (BOT_ACTIVE or HUMAN_ACTIVE) conversations.
// If the existing conversation is CLOSED, creates a new one.
chatRouter.post('/conversations', async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: 'visitorId required' });

    // ONLY look for non-closed conversations
    const existingConvs = await db.select()
      .from(conversation)
      .where(eq(conversation.userId, visitorId))
      .orderBy(desc(conversation.updatedAt))
      .limit(1);

    const existingConv = existingConvs[0];
    
    // If found and NOT closed, return it with messages
    if (existingConv && existingConv.status !== 'CLOSED') {
      const messages = await db.select()
        .from(message)
        .where(eq(message.conversationId, existingConv.id))
        .orderBy(message.createdAt);
      
      return res.json({
        ...existingConv,
        messages,
      });
    }

    // Otherwise create a fresh conversation
    const settings = await db.select()
      .from(content)
      .where(eq(content.key, 'chatbot_greeting'))
      .limit(1);
    
    const greetingText = settings[0]?.value || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
    
    const { newConv, botGreeting } = await db.transaction(async (tx) => {
      const conversationId = crypto.randomUUID();
      const greetingId = crypto.randomUUID();

      await tx.insert(conversation).values({
        id: conversationId,
        userId: visitorId,
        status: 'BOT_ACTIVE',
      });

      await tx.insert(message).values({
        id: greetingId,
        conversationId,
        senderType: 'BOT',
        content: greetingText,
      });

      const [createdConversation] = await tx.select()
        .from(conversation)
        .where(eq(conversation.id, conversationId))
        .limit(1);

      const [createdGreeting] = await tx.select()
        .from(message)
        .where(eq(message.id, greetingId))
        .limit(1);

      return { newConv: createdConversation, botGreeting: createdGreeting };
    });

    return res.json({
      ...newConv,
      messages: [botGreeting]
    });
  } catch (error) {
    console.error('Failed to get/create conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add Message
chatRouter.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { senderType, content } = req.body;

    if (!content) return res.status(400).json({ error: 'Message content required' });

    const newMsg = await db.transaction(async (tx) => {
      const messageId = crypto.randomUUID();
      await tx.insert(message).values({
        id: messageId,
        conversationId: id,
        senderType,
        content,
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close Conversation
chatRouter.post('/conversations/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    await db.update(conversation).set({
      status: 'CLOSED',
      needsHuman: false,
    }).where(eq(conversation.id, id));

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to close conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request Human Takeover
chatRouter.post('/conversations/:id/takeover', async (req, res) => {
  try {
    const { id } = req.params;
    await db.update(conversation).set({
      needsHuman: true,
      updatedAt: new Date()
    }).where(eq(conversation.id, id));

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to request human takeover:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Poll Messages
chatRouter.get('/messages', async (req, res) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId || typeof conversationId !== 'string') {
      return res.status(400).json({ error: 'conversationId required' });
    }

    const conv = await db.query.conversation.findFirst({
      where: eq(conversation.id, conversationId),
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
  } catch (error) {
    console.error('Failed to poll messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
