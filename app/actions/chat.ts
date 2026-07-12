"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/app/actions/settings";
import { requirePermission } from "@/lib/permissions";

export async function getOrCreateConversation(userId: string) {
  if (!userId) {
    throw new Error("Missing user ID");
  }

  // Find an active conversation for this user
  let conversation = await prisma.conversation.findFirst({
    where: {
      userId: userId,
      status: { in: ["BOT_ACTIVE", "HUMAN_ACTIVE"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // If not found, create a new one
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: userId,
        status: "BOT_ACTIVE",
      },
      include: {
        messages: true,
      },
    });

    // Add initial bot greeting if starting a new conversation
    const settings = await getSettings();
    const greetingText = settings.chatbot_greeting || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
    const initialGreeting = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "BOT",
        content: greetingText,
      },
    });

    conversation.messages = [initialGreeting];
    
    revalidatePath("/admin/chat");
  }

  return conversation;
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

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderType,
      content,
    },
  });

  // Touch the conversation's updatedAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/admin/chat");

  return message;
}

export async function takeOverConversation(conversationId: string, adminEmail: string) {
  await requirePermission("send_chat_messages");

  if (!conversationId || !adminEmail) {
    throw new Error("Missing conversation ID or admin email");
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "HUMAN_ACTIVE",
      takenBy: adminEmail,
      needsHuman: false,
    },
  });

  // Post system bot message indicating handover
  await prisma.message.create({
    data: {
      conversationId,
      senderType: "BOT",
      content: "A consultant has joined the chat.",
    },
  });

  revalidatePath("/admin/chat");

  return conversation;
}

export async function requestHumanTakeover(conversationId: string) {
  if (!conversationId) {
    throw new Error("Missing conversation ID");
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      needsHuman: true,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin/chat");

  return conversation;
}

export async function getConversationsForAdmin() {
  await requirePermission("view_chat");

  return await prisma.conversation.findMany({
    where: {
      status: { in: ["BOT_ACTIVE", "HUMAN_ACTIVE"] },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function closeConversation(conversationId: string, closedBy: "USER" | "ADMIN" = "ADMIN") {
  if (closedBy === "ADMIN") {
    await requirePermission("send_chat_messages");
  }

  if (!conversationId) {
    throw new Error("Missing conversation ID");
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "CLOSED",
      needsHuman: false,
    },
  });

  // Post system bot message indicating closed
  await prisma.message.create({
    data: {
      conversationId,
      senderType: "BOT",
      content: "Conversation resolved and closed.",
    },
  });

  revalidatePath("/admin/chat");

  return conversation;
}

export async function pauseConversation(conversationId: string) {
  await requirePermission("send_chat_messages");

  if (!conversationId) {
    throw new Error("Missing conversation ID");
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "BOT_ACTIVE",
      needsHuman: false,
    },
  });

  // Post system bot message indicating pause
  await prisma.message.create({
    data: {
      conversationId,
      senderType: "BOT",
      content: "Live support paused. Bot active.",
    },
  });

  revalidatePath("/admin/chat");

  return conversation;
}
