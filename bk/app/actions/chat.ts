"use server";

import { db } from "@/lib/db";
import { conversation, message } from "@/db/schema";
import { eq, desc, asc, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/app/actions/settings";
import { requirePermission } from "@/lib/permissions";

export async function getOrCreateConversation(userId: string) {
  if (!userId) {
    throw new Error("Missing user ID");
  }

  // Find an active conversation for this user
  let conversations = await db.query.conversation.findMany({
    where: and(
      eq(conversation.userId, userId),
      inArray(conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"])
    ),
    orderBy: [desc(conversation.updatedAt)],
    with: {
      messages: {
        orderBy: [asc(message.createdAt)],
      },
    },
  });
  let conv = conversations[0];

  // If not found, create a new one
  if (!conv) {
    await db.insert(conversation).values({
      userId: userId,
      status: "BOT_ACTIVE",
    });

    conversations = await db.query.conversation.findMany({
      where: and(
        eq(conversation.userId, userId),
        inArray(conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"])
      ),
      orderBy: [desc(conversation.updatedAt)],
      with: {
        messages: {
          orderBy: [asc(message.createdAt)],
        },
      },
    });
    conv = conversations[0];

    // Add initial bot greeting if starting a new conversation
    const settings = await getSettings();
    const greetingText = settings.chatbot_greeting || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
    await db.insert(message).values({
      conversationId: conv.id,
      senderType: "BOT",
      content: greetingText,
    });
    
    conv.messages = [{ senderType: "BOT", content: greetingText } as any];
    
    revalidatePath("/admin/chat");
  }

  return conv;
}

export async function addChatMessage(
  conversationId: string,
  senderType: "USER" | "ADMIN" | "BOT",
  content: string
) {
  if (!conversationId || !content) {
    throw new Error("Missing required fields for message");
  }

  if (senderType === "ADMIN") {
    await requirePermission("send_chat_messages");
  }

  await db.insert(message).values({
    conversationId,
    senderType,
    content,
  });

  const msgs = await db.select().from(message).where(and(eq(message.conversationId, conversationId), eq(message.content, content))).orderBy(desc(message.createdAt));
  const newMsg = msgs[0];

  // Touch the conversation's updatedAt timestamp
  await db.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, conversationId));

  revalidatePath("/admin/chat");

  return newMsg;
}

export async function takeOverConversation(conversationId: string, adminEmail: string) {
  await requirePermission("send_chat_messages");

  if (!conversationId || !adminEmail) {
    throw new Error("Missing conversation ID or admin email");
  }

  await db.update(conversation).set({
    status: "HUMAN_ACTIVE",
    takenBy: adminEmail,
    needsHuman: false,
  }).where(eq(conversation.id, conversationId));

  const updatedConvs = await db.select().from(conversation).where(eq(conversation.id, conversationId));

  // Post system bot message indicating handover
  await db.insert(message).values({
    conversationId,
    senderType: "BOT",
    content: "A consultant has joined the chat.",
  });

  revalidatePath("/admin/chat");

  return updatedConvs[0];
}

export async function requestHumanTakeover(conversationId: string) {
  if (!conversationId) {
    throw new Error("Missing conversation ID");
  }

  await db.update(conversation).set({
    needsHuman: true,
    updatedAt: new Date(),
  }).where(eq(conversation.id, conversationId));

  const updatedConvs = await db.select().from(conversation).where(eq(conversation.id, conversationId));

  revalidatePath("/admin/chat");

  return updatedConvs[0];
}

export async function getConversationsForAdmin() {
  await requirePermission("view_chat");

  return await db.query.conversation.findMany({
    where: inArray(conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"]),
    with: {
      messages: {
        orderBy: [asc(message.createdAt)],
      },
    },
    orderBy: [desc(conversation.updatedAt)],
  });
}

export async function closeConversation(conversationId: string, closedBy: "USER" | "ADMIN" = "ADMIN") {
  if (closedBy === "ADMIN") {
    await requirePermission("send_chat_messages");
  }

  if (!conversationId) {
    throw new Error("Missing conversation ID");
  }

  await db.update(conversation).set({
    status: "CLOSED",
    needsHuman: false,
  }).where(eq(conversation.id, conversationId));

  const updatedConvs = await db.select().from(conversation).where(eq(conversation.id, conversationId));

  // Post system bot message indicating closed
  await db.insert(message).values({
    conversationId,
    senderType: "BOT",
    content: "Conversation resolved and closed.",
  });

  revalidatePath("/admin/chat");

  return updatedConvs[0];
}

export async function pauseConversation(conversationId: string) {
  await requirePermission("send_chat_messages");

  if (!conversationId) {
    throw new Error("Missing conversation ID");
  }

  await db.update(conversation).set({
    status: "BOT_ACTIVE",
    needsHuman: false,
  }).where(eq(conversation.id, conversationId));

  const updatedConvs = await db.select().from(conversation).where(eq(conversation.id, conversationId));

  // Post system bot message indicating pause
  await db.insert(message).values({
    conversationId,
    senderType: "BOT",
    content: "Live support paused. Bot active.",
  });

  revalidatePath("/admin/chat");

  return updatedConvs[0];
}
