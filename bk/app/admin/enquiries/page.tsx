import type { Metadata } from "next";
import { checkPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import EnquiriesClient from "./EnquiriesClient";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPageWrapper() {
  const hasAccess = await checkPermission("view_enquiries");
  if (!hasAccess) {
    return <AccessDenied permission="view_enquiries" />;
  }

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <span className="w-8 h-8 border-2 border-white/10 border-t-[#04a891] rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading enquiries...</p>
      </div>
    }>
      <EnquiriesClient />
    </Suspense>
  );
}
