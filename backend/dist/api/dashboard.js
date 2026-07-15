"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const [openJobsCountRes, totalEnquiriesCountRes, unreadEnquiriesCountRes, cvsCountRes, recentEnquiriesRes, recentChatsRes, allConversationsRes,] = await Promise.all([
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.job).where((0, drizzle_orm_1.eq)(schema_1.job.status, "ACTIVE")),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.enquiry),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.enquiry).where((0, drizzle_orm_1.eq)(schema_1.enquiry.status, "NEW")),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.enquiry).where((0, drizzle_orm_1.eq)(schema_1.enquiry.type, "CANDIDATE")),
            db_1.db.select().from(schema_1.enquiry).orderBy((0, drizzle_orm_1.desc)(schema_1.enquiry.createdAt)).limit(4),
            db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.inArray)(schema_1.conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"])).orderBy((0, drizzle_orm_1.desc)(schema_1.conversation.updatedAt)).limit(4),
            // All conversations with messages to compute avg response time
            db_1.db.select().from(schema_1.conversation).limit(100),
        ]);
        const openJobsCount = Number(openJobsCountRes[0].count);
        const totalEnquiriesCount = Number(totalEnquiriesCountRes[0].count);
        const unreadEnquiriesCount = Number(unreadEnquiriesCountRes[0].count);
        const cvsCount = Number(cvsCountRes[0].count);
        // Fetch latest message for each recent chat
        const recentChats = await Promise.all(recentChatsRes.map(async (c) => {
            const msgs = await db_1.db.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.conversationId, c.id)).orderBy((0, drizzle_orm_1.desc)(schema_1.message.createdAt)).limit(1);
            return { ...c, messages: msgs };
        }));
        // Calculate avg response time like the old site
        let avgResponseMin = 0;
        let avgResponseText = "Under 5m";
        let avgResponseDelta = "Under 1h target ✓";
        if (allConversationsRes.length > 0) {
            let totalDiffMins = 0;
            let sampleCount = 0;
            for (const c of allConversationsRes) {
                const msgs = await db_1.db.select()
                    .from(schema_1.message)
                    .where((0, drizzle_orm_1.eq)(schema_1.message.conversationId, c.id))
                    .orderBy(schema_1.message.createdAt);
                let pendingUserMessageTime = null;
                for (const m of msgs) {
                    if (m.senderType === "USER") {
                        if (!pendingUserMessageTime) {
                            pendingUserMessageTime = m.createdAt;
                        }
                    }
                    else if (m.senderType === "ADMIN") {
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
            }
            else if (avgResponseMin < 60) {
                avgResponseText = `${avgResponseMin}m`;
            }
            else {
                const d = Math.floor(avgResponseMin / (24 * 60));
                const h = Math.floor((avgResponseMin % (24 * 60)) / 60);
                const m = avgResponseMin % 60;
                if (d > 0) {
                    avgResponseText = `${d}d ${h}h`;
                }
                else {
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
    }
    catch (error) {
        console.error("Failed to load dashboard stats:", error);
        res.status(500).json({ error: "Failed to load dashboard stats" });
    }
});
