import { db } from '../lib/db';
import { conversation, message } from '../db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  console.log('Starting backfill of chat records...');

  // Update conversations
  const conversations = await db.select().from(conversation);
  let convUpdated = 0;
  for (const c of conversations) {
    let newMode = 'CLOSED';
    let newStatus = 'RESOLVED';

    if (c.status === 'BOT_ACTIVE') {
      newMode = 'AI';
      newStatus = 'OPEN';
    } else if (c.status === 'HUMAN_ACTIVE') {
      newMode = 'HUMAN';
      newStatus = 'OPEN';
    } else if (c.status === 'CLOSED') {
      newMode = 'CLOSED';
      newStatus = 'RESOLVED';
    }

    if (c.needsHuman && c.status !== 'CLOSED') {
      newMode = 'HUMAN';
      newStatus = 'WAITING_FOR_ADMIN';
    }

    await db.update(conversation)
      .set({ mode: newMode, chatStatus: newStatus })
      .where(eq(conversation.id, c.id));
    convUpdated++;
  }
  console.log(`Updated ${convUpdated} conversations.`);

  // Update messages
  const messages = await db.select().from(message);
  let msgUpdated = 0;
  for (const m of messages) {
    let newSender = 'SYSTEM';
    if (m.senderType === 'USER') newSender = 'USER';
    else if (m.senderType === 'BOT') newSender = 'AI';
    else if (m.senderType === 'ADMIN') newSender = 'ADMIN';

    await db.update(message)
      .set({ sender: newSender })
      .where(eq(message.id, m.id));
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
