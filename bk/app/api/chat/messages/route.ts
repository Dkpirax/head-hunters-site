import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { message, conversation as conversationTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

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

    const messages = await db
      .select()
      .from(message)
      .where(eq(message.conversationId, conversationId))
      .orderBy(asc(message.createdAt));

    // Also fetch the conversation's takeover/status to update the client UI
    const conversations = await db
      .select({
        status: conversationTable.status,
        takenBy: conversationTable.takenBy,
        needsHuman: conversationTable.needsHuman,
      })
      .from(conversationTable)
      .where(eq(conversationTable.id, conversationId));
    const conversation = conversations[0];

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
