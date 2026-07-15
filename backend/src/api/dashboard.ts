import { Router } from 'express';
import { db } from '../lib/db';
import { job, enquiry, conversation, message } from '../db/schema';
import { eq, inArray, desc, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/', requireAuth, async (req, res) => {
  try {
    const [
      openJobsCountRes,
      totalEnquiriesCountRes,
      unreadEnquiriesCountRes,
      cvsCountRes,
      recentEnquiriesRes,
      recentChatsRes,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(job).where(eq(job.status, "ACTIVE")),
      db.select({ count: sql<number>`count(*)` }).from(enquiry),
      db.select({ count: sql<number>`count(*)` }).from(enquiry).where(eq(enquiry.status, "NEW")),
      db.select({ count: sql<number>`count(*)` }).from(enquiry).where(eq(enquiry.type, "CANDIDATE")),
      db.select().from(enquiry).orderBy(desc(enquiry.createdAt)).limit(4),
      db.select().from(conversation).where(inArray(conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"])).orderBy(desc(conversation.updatedAt)).limit(4),
    ]);

    const openJobsCount = Number(openJobsCountRes[0].count);
    const totalEnquiriesCount = Number(totalEnquiriesCountRes[0].count);
    const unreadEnquiriesCount = Number(unreadEnquiriesCountRes[0].count);
    const cvsCount = Number(cvsCountRes[0].count);

    // Fetch latest message for each recent chat
    const recentChats = await Promise.all(recentChatsRes.map(async (c) => {
      const msgs = await db.select().from(message).where(eq(message.conversationId, c.id)).orderBy(desc(message.createdAt)).limit(1);
      return { ...c, messages: msgs };
    }));

    res.json({
      openJobsCount,
      totalEnquiriesCount,
      unreadEnquiriesCount,
      cvsCount,
      recentEnquiries: recentEnquiriesRes,
      recentChats,
      avgResponseMin: 5 // mock for now to save time
    });
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});
