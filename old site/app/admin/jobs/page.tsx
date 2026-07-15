import type { Metadata } from "next";
import { checkPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import AdminJobsPage from "./JobsClient";

export const metadata: Metadata = { title: "Job Listings" };

export default async function AdminJobsPageWrapper() {
  const hasAccess = await checkPermission("manage_jobs");
  if (!hasAccess) {
    return <AccessDenied permission="manage_jobs" />;
  }

  return <AdminJobsPage />;
}
