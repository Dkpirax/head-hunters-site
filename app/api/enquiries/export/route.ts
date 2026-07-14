import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiry } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  try {
    await requirePermission("export_data");
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const enquiries = await db
      .select()
      .from(enquiry)
      .orderBy(desc(enquiry.createdAt));

    const headers = ["ID", "Name", "Email", "Phone", "Type", "Status", "Message", "Created At"];
    const rows = enquiries.map((e: any) => [
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
