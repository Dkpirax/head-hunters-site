import type { Metadata } from "next";
import { checkPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import AdminArticlesPage from "./InsightsClient";

export const metadata: Metadata = { title: "Insights" };

export default async function AdminArticlesPageWrapper() {
  const hasAccess = await checkPermission("manage_insights");
  if (!hasAccess) {
    return <AccessDenied permission="manage_insights" />;
  }

  return <AdminArticlesPage />;
}
