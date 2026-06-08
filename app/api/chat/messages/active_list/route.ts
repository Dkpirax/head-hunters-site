import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Conversation, Message } from "@prisma/client";

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
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

    // Format dates to avoid JSON parsing issues
    const formatted = conversations.map((c: Conversation & { messages: Message[] }) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messages: c.messages.map((m: Message) => ({
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
