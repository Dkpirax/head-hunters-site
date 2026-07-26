"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function run() {
    console.log('Starting backfill of chat records...');
    // Update conversations
    const conversations = await db_1.db.select().from(schema_1.conversation);
    let convUpdated = 0;
    for (const c of conversations) {
        let newMode = 'CLOSED';
        let newStatus = 'RESOLVED';
        if (c.status === 'BOT_ACTIVE') {
            newMode = 'AI';
            newStatus = 'OPEN';
        }
        else if (c.status === 'HUMAN_ACTIVE') {
            newMode = 'HUMAN';
            newStatus = 'OPEN';
        }
        else if (c.status === 'CLOSED') {
            newMode = 'CLOSED';
            newStatus = 'RESOLVED';
        }
        if (c.needsHuman && c.status !== 'CLOSED') {
            newMode = 'HUMAN';
            newStatus = 'WAITING_FOR_ADMIN';
        }
        await db_1.db.update(schema_1.conversation)
            .set({ mode: newMode, chatStatus: newStatus })
            .where((0, drizzle_orm_1.eq)(schema_1.conversation.id, c.id));
        convUpdated++;
    }
    console.log(`Updated ${convUpdated} conversations.`);
    // Update messages
    const messages = await db_1.db.select().from(schema_1.message);
    let msgUpdated = 0;
    for (const m of messages) {
        let newSender = 'SYSTEM';
        if (m.senderType === 'USER')
            newSender = 'USER';
        else if (m.senderType === 'BOT')
            newSender = 'AI';
        else if (m.senderType === 'ADMIN')
            newSender = 'ADMIN';
        await db_1.db.update(schema_1.message)
            .set({ sender: newSender })
            .where((0, drizzle_orm_1.eq)(schema_1.message.id, m.id));
        msgUpdated++;
    }
    console.log(`Updated ${msgUpdated} messages.`);
    console.log('Backfill complete!');
    process.exit(0);
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
