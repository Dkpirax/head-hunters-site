import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser, enquiry, conversation, message } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db
    .select()
    .from(adminUser)
    .where(eq(adminUser.email, session.user.email.toLowerCase()));
  const user = users[0];

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isSuper = user.role === "SUPER_ADMIN";
  const canViewEnquiries = isSuper || await hasPermission(user.id, "view_enquiries");
  const canViewChat = isSuper || await hasPermission(user.id, "view_chat");

  if (!canViewEnquiries && !canViewChat) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    // 1. Get new enquiries (status is NEW)
    const newEnquiries = canViewEnquiries
      ? await db.select().from(enquiry).where(eq(enquiry.status, "NEW")).orderBy(desc(enquiry.createdAt))
      : [];

    // 2. Get active conversations that need human assistance (needsHuman is true)
    const takeoverConversations = canViewChat
      ? await db.query.conversation.findMany({
          where: eq(conversation.needsHuman, true),
          with: {
            messages: {
              orderBy: [desc(message.createdAt)],
              limit: 1,
            },
          },
          orderBy: [desc(conversation.updatedAt)],
        })
      : [];

    // 3. Map to standard notification format
    const notifications = [
      ...newEnquiries.map((e: any) => ({
        id: `enquiry-${e.id}`,
        type: "ENQUIRY" as const,
        title: "New Enquiry Received",
        description: `${e.name} (${e.type})`,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
        link: `/admin/enquiries?id=${e.id}`,
      })),
      ...takeoverConversations.map((c: any) => {
        const lastMsg = c.messages[0]?.content || "No messages yet";
        const visitorName = `Visitor #${c.userId.substring(c.userId.length - 4)}`;
        return {
          id: `chat-${c.id}`,
          type: "CHAT" as const,
          title: "Takeover Requested",
          description: visitorName,
          message: lastMsg,
          createdAt: c.updatedAt.toISOString(),
          link: `/admin/chat?select=${c.id}`,
        };
      }),
    ];

    // Sort notifications by date descending (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
