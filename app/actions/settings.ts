"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    const records = await prisma.content.findMany({
      where: {
        key: { startsWith: "settings." },
      },
    });

    const settings: Record<string, string> = {};
    records.forEach((r) => {
      settings[r.key.replace("settings.", "")] = r.value;
    });

    return {
      siteName: settings.siteName || "Head Hunters",
      notifyEmails: settings.notifyEmails || "hello@headhunters.com.au",
      autoReplyDelay: settings.autoReplyDelay || "600",
      typingIndicatorEnabled: settings.typingIndicatorEnabled !== "false",
      humanTakeoverEnabled: settings.humanTakeoverEnabled !== "false",
      whatsappNumber: settings.whatsappNumber || "",
      calendlyLink: settings.calendlyLink || "",
      bullhornMode: settings.bullhornMode || "off",
      rateLimit: settings.rateLimit || "10",
      offlineMessage: settings.offlineMessage || "We'll get back soon",
    };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return {
      siteName: "Head Hunters",
      notifyEmails: "hello@headhunters.com.au",
      autoReplyDelay: "600",
      typingIndicatorEnabled: true,
      humanTakeoverEnabled: true,
      whatsappNumber: "",
      calendlyLink: "",
      bullhornMode: "off",
      rateLimit: "10",
      offlineMessage: "We'll get back soon",
    };
  }
}

export async function updateSettings(data: {
  siteName: string;
  notifyEmails: string;
  autoReplyDelay: string;
  typingIndicatorEnabled: boolean;
  humanTakeoverEnabled: boolean;
  whatsappNumber: string;
  calendlyLink: string;
  bullhornMode: string;
  rateLimit: string;
  offlineMessage: string;
}) {
  try {
    const settingsToSave = {
      "settings.siteName": data.siteName,
      "settings.notifyEmails": data.notifyEmails,
      "settings.autoReplyDelay": data.autoReplyDelay,
      "settings.typingIndicatorEnabled": String(data.typingIndicatorEnabled),
      "settings.humanTakeoverEnabled": String(data.humanTakeoverEnabled),
      "settings.whatsappNumber": data.whatsappNumber,
      "settings.calendlyLink": data.calendlyLink,
      "settings.bullhornMode": data.bullhornMode,
      "settings.rateLimit": data.rateLimit,
      "settings.offlineMessage": data.offlineMessage,
    };

    for (const [key, value] of Object.entries(settingsToSave)) {
      await prisma.content.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw new Error("Failed to save settings.");
  }
}
