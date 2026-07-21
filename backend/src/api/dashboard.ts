import { Router } from 'express';
import { db } from '../lib/db';
import { job, enquiry, conversation, message } from '../db/schema';
import { eq, inArray, desc, asc, sql } from 'drizzle-orm';
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
      allConversationsRes,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(job).where(eq(job.status, "ACTIVE")),
      db.select({ count: sql<number>`count(*)` }).from(enquiry),
      db.select({ count: sql<number>`count(*)` }).from(enquiry).where(eq(enquiry.status, "NEW")),
      db.select({ count: sql<number>`count(*)` }).from(enquiry).where(eq(enquiry.type, "CANDIDATE")),
      db.select().from(enquiry).orderBy(desc(enquiry.createdAt)).limit(4),
      db.select().from(conversation).limit(100),
    ]);

    const openJobsCount = Number(openJobsCountRes[0].count);
    const totalEnquiriesCount = Number(totalEnquiriesCountRes[0].count);
    const unreadEnquiriesCount = Number(unreadEnquiriesCountRes[0].count);
    const cvsCount = Number(cvsCountRes[0].count);

    // Fetch recent active conversations (excluding abandoned bot-only sessions and resolved chats)
    const allRecentConvs = await db.select().from(conversation).orderBy(desc(conversation.updatedAt)).limit(20);
    const recentChatsWithMsgs = await Promise.all(allRecentConvs.map(async (c) => {
      const msgs = await db.select().from(message).where(eq(message.conversationId, c.id)).orderBy(asc(message.createdAt));
      return { ...c, messages: msgs };
    }));

    const recentChats = recentChatsWithMsgs
      .filter((c) => {
        if (c.chatStatus === 'RESOLVED' || c.mode === 'CLOSED') return false;
        // Exclude single-greeting abandoned bot chats
        if ((c.mode === 'AI' || c.status === 'BOT_ACTIVE') && c.messages.length <= 1 && !c.needsHuman && c.chatStatus !== 'WAITING_FOR_ADMIN') {
          return false;
        }
        return true;
      })
      .slice(0, 4);

    // Calculate avg response time like the old site
    let avgResponseMin = 0;
    let avgResponseText = "Under 5m";
    let avgResponseDelta = "Under 1h target ✓";

    if (allConversationsRes.length > 0) {
      let totalDiffMins = 0;
      let sampleCount = 0;

      for (const c of allConversationsRes) {
        const msgs = await db.select()
          .from(message)
          .where(eq(message.conversationId, c.id))
          .orderBy(message.createdAt);

        let pendingUserMessageTime: Date | null = null;
        for (const m of msgs) {
          if (m.senderType === "USER") {
            if (!pendingUserMessageTime) {
              pendingUserMessageTime = m.createdAt;
            }
          } else if (m.senderType === "ADMIN") {
            if (pendingUserMessageTime) {
              const diffMs = m.createdAt.getTime() - pendingUserMessageTime.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              if (diffMins >= 0) {
                totalDiffMins += diffMins;
                sampleCount++;
              }
              pendingUserMessageTime = null;
            }
          }
        }
      }

      avgResponseMin = sampleCount > 0 ? Math.round(totalDiffMins / sampleCount) : 0;

      if (avgResponseMin === 0) {
        avgResponseText = "Under 5m";
      } else if (avgResponseMin < 60) {
        avgResponseText = `${avgResponseMin}m`;
      } else {
        const d = Math.floor(avgResponseMin / (24 * 60));
        const h = Math.floor((avgResponseMin % (24 * 60)) / 60);
        const m = avgResponseMin % 60;
        if (d > 0) {
          avgResponseText = `${d}d ${h}h`;
        } else {
          avgResponseText = `${h}h ${m}m`;
        }
      }

      avgResponseDelta = avgResponseMin <= 60 ? "Under 1h target ✓" : "Above 1h target";
    }

    res.json({
      openJobsCount,
      totalEnquiriesCount,
      unreadEnquiriesCount,
      cvsCount,
      recentEnquiries: recentEnquiriesRes,
      recentChats,
      avgResponseMin,
      avgResponseText,
      avgResponseDelta,
    });
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});
