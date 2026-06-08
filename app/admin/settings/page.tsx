import type { Metadata } from "next";
import { getSettings } from "@/app/actions/settings";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const initialSettings = await getSettings();
  
  return <SettingsClient initialSettings={initialSettings} />;
}
