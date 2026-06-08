import type { Metadata } from "next";
import { getConversationsForAdmin } from "@/app/actions/chat";
import { auth } from "@/lib/auth";
import type { Conversation, Message } from "@prisma/client";
import ChatAdminClient from "./ChatAdminClient";

export const metadata: Metadata = { title: "Live Chats" };

export default async function AdminChatPage() {
  const session = await auth();
  const adminEmail = session?.user?.email || "admin@headhunters.com.au";
  const conversations = await getConversationsForAdmin();
  
  // Format dates so they can be passed as standard props to the Client Component
  const formattedConversations = conversations.map((c: Conversation & { messages: Message[] }) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    messages: c.messages.map((m: Message) => ({
      ...m,
      senderType: m.senderType as "USER" | "ADMIN" | "BOT",
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return <ChatAdminClient initialConversations={formattedConversations} adminEmail={adminEmail} />;
}
