import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId parameter" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    // Also fetch the conversation's takeover/status to update the client UI
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { status: true, takenBy: true, needsHuman: true },
    });

    return NextResponse.json({
      messages,
      status: conversation?.status || "BOT_ACTIVE",
      takenBy: conversation?.takenBy || null,
      needsHuman: conversation?.needsHuman || false,
    });
  } catch (error) {
    console.error("Failed to poll chat messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
