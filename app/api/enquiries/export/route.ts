import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = ["ID", "Name", "Email", "Phone", "Type", "Status", "Message", "Created At"];
    const rows = enquiries.map((e) => [
      e.id,
      e.name,
      e.email,
      e.phone || "",
      e.type,
      e.status,
      `"${e.message.replace(/"/g, '""')}"`,
      e.createdAt.toISOString(),
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="enquiries-${new Date().toISOString().split("T")[0]}.csv"`,
        "Cache-Control": "no-cache",
      },
    });

    return response;
  } catch (error) {
    console.error("Failed to export enquiries CSV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
