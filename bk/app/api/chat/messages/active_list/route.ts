import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversation, message } from "@/db/schema";
import { inArray, desc, asc } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  try {
    await requirePermission("view_chat");
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const conversations = await db.query.conversation.findMany({
      where: inArray(conversation.status, ["BOT_ACTIVE", "HUMAN_ACTIVE"]),
      with: {
        messages: {
          orderBy: [asc(message.createdAt)],
        },
      },
      orderBy: [desc(conversation.updatedAt)],
    });

    // Format dates to avoid JSON parsing issues
    const formatted = conversations.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messages: c.messages.map((m: any) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch active conversations list:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
