import type { Metadata } from "next";
import { getSettings } from "@/app/actions/settings";
import SettingsClient from "./SettingsClient";
import { checkPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const canManageGeneral = await checkPermission("manage_settings");
  const canManageHomepage = await checkPermission("manage_homepage_copy");
  const canManageToggles = await checkPermission("manage_section_toggles");

  if (!canManageGeneral && !canManageHomepage && !canManageToggles) {
    return <AccessDenied permission="manage_homepage_copy / manage_section_toggles / manage_settings" />;
  }

  const initialSettings = await getSettings();
  
  return (
    <SettingsClient
      initialSettings={initialSettings}
      canManageGeneral={canManageGeneral}
      canManageHomepage={canManageHomepage}
      canManageToggles={canManageToggles}
    />
  );
}
