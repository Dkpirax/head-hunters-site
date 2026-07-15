import { Router } from "express";
import { db } from "../../lib/db";
import { conversation, message } from "../../db/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";

const router = Router();

// Get active conversations list
router.get("/active_list", async (req, res) => {
  try {
    const list = await db.query.conversation.findMany({
      where: inArray(conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"]),
      with: {
        messages: {
          orderBy: [asc(message.createdAt)],
        },
      },
      orderBy: [desc(conversation.updatedAt)],
    });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a session
router.get("/sessions/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const convs = await db.query.conversation.findMany({
      where: eq(conversation.id, id),
      with: {
        messages: {
          orderBy: [asc(message.createdAt)],
        },
      },
    });
    
    if (convs.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    res.json(convs[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Take over conversation
router.post("/sessions/:id/takeover", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminEmail } = req.body;
    
    await db.update(conversation).set({
      status: "HUMAN_ACTIVE",
      takenBy: adminEmail,
      needsHuman: false,
    }).where(eq(conversation.id, id));
    
    await db.insert(message).values({
      conversationId: id,
      senderType: "BOT",
      content: "A consultant has joined the chat.",
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to take over chat" });
  }
});

// Close conversation
router.post("/sessions/:id/close", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.update(conversation).set({
      status: "CLOSED",
      needsHuman: false,
    }).where(eq(conversation.id, id));
    
    await db.insert(message).values({
      conversationId: id,
      senderType: "BOT",
      content: "Conversation resolved and closed.",
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to close chat" });
  }
});

// Pause conversation
router.post("/sessions/:id/pause", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.update(conversation).set({
      status: "BOT_ACTIVE",
      needsHuman: false,
    }).where(eq(conversation.id, id));
    
    await db.insert(message).values({
      conversationId: id,
      senderType: "BOT",
      content: "Live support paused. Bot active.",
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to pause chat" });
  }
});

// Add message
router.post("/sessions/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { senderType, content } = req.body;
    
    await db.insert(message).values({
      conversationId: id,
      senderType,
      content,
    });
    
    await db.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, id));
    
    const newMsg = await db.query.message.findFirst({
      where: eq(message.conversationId, id),
      orderBy: [desc(message.createdAt)],
    });
    
    res.json(newMsg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
