"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/permissions";

// Merged default settings containing Homepage Copy, Section Toggles, and General configurations
const defaultSettings = {
  // General & Site Config
  site_name: "Head Hunters",
  chatbot_greeting: "Hello! How can I help?",
  offline_message: "We'll get back soon",
  auto_reply_delay: "600",
  rate_limit: "10",

  // Homepage copy
  hero_headline: "Hire Better. Grow Faster.",
  hero_subheadline: "Precision hiring for modern businesses.",
  hero_cta_primary: "Talk to a consultant",
  hero_cta_secondary: "Submit your CV",
  services_tagline: "Our Services",
  services_description: "End-to-end recruitment solutions built for modern businesses.",
  story_title: "Our Story",
  story_text: "From a home‑based startup to a trusted recruitment partner across three countries.",
  global_reach_title: "Global Reach, Local Expertise",
  global_reach_text: "Serving Australia, New Zealand, and Sri Lanka.",
  testimonials_title: "What Our Clients Say",
  contact_title: "Let’s Talk",
  copyright_text: "© Head Hunters. All rights reserved.",
  linkedin_url: "https://linkedin.com/company/headhunters",
  twitter_url: "https://twitter.com/headhunters",
  facebook_url: "https://facebook.com/headhunters",
  ios_app_url: "",
  android_app_url: "",

  // Section toggles
  show_hero: true,
  show_stats: true,
  show_services: true,
  show_standards: true,
  show_employer_flow: true,
  show_jobs: true,
  show_story: true,
  show_global_reach: true,
  show_testimonials: true,
  show_contact: true,

  // Feature Flags
  flag_chatbot_enabled: true,
  flag_hybrid_chat_enabled: true,
  flag_rate_limiting_enabled: true,
  flag_live_jobs_enabled: false,

  // Email Config
  email_notify_list: "hello@headhunters.com.au",
  email_from_address: "noreply@headhunters.com.au",

  // Integrations
  integration_whatsapp_number: "",
  integration_calendly_url: "https://calendly.com/headhunters/15min",
  integration_google_reviews_embed: "",
  integration_bullhorn_enabled: false,
  integration_bullhorn_api_url: "",
  integration_bullhorn_client_id: "",

  // Maintenance Mode
  maintenance_mode_enabled: false,
  maintenance_message: "We are currently performing scheduled maintenance. Please check back soon.",

  // SEO & AI
  seo_meta_title_suffix: " | Head Hunters Recruitment",
  seo_default_description: "Head Hunters provides executive search, permanent recruitment, and talent solutions across Australia, New Zealand, and Sri Lanka.",
  seo_og_image_url: "/images/og-default.jpg",
  ai_chatbot_model: "gpt-4o-mini",
  ai_job_matching_enabled: false,
};

export async function getSettings() {
  try {
    const settings = await prisma.content.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      // Normalize: strip "settings." prefix to match schema keys
      const normalizedKey = s.key.startsWith("settings.") ? s.key.replace("settings.", "") : s.key;
      settingsMap[normalizedKey] = s.value;
    }

    // Mapping of legacy keys to new settings schema keys
    const keyAliases: Record<string, string> = {
      siteName: "site_name",
      notifyEmails: "email_notify_list",
      whatsappNumber: "integration_whatsapp_number",
      calendlyLink: "integration_calendly_url",
      bullhornMode: "integration_bullhorn_enabled",
      autoReplyDelay: "auto_reply_delay",
      typingIndicatorEnabled: "flag_typing_indicator_enabled",
      humanTakeoverEnabled: "flag_hybrid_chat_enabled",
      rateLimit: "rate_limit",
      offlineMessage: "offline_message",
    };

    // Merge defaults with DB values
    const result = { ...defaultSettings };
    for (const key of Object.keys(defaultSettings)) {
      let dbValue = settingsMap[key];

      // Handle legacy compatibility mapping
      if (dbValue === undefined) {
        const legacyKey = Object.keys(keyAliases).find((k) => keyAliases[k] === key);
        if (legacyKey && settingsMap[legacyKey] !== undefined) {
          dbValue = settingsMap[legacyKey];
        }
      }

      if (dbValue !== undefined) {
        if (typeof defaultSettings[key as keyof typeof defaultSettings] === "boolean") {
          // Special case: map legacy "off"/"sandbox"/"live" bullhornMode to boolean
          if (key === "integration_bullhorn_enabled" && (dbValue === "sandbox" || dbValue === "live")) {
            (result as any)[key] = true;
          } else {
            (result as any)[key] = dbValue === "true";
          }
        } else {
          (result as any)[key] = dbValue;
        }
      }
    }
    return result;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return defaultSettings;
  }
}

const HOMEPAGE_COPY_KEYS = [
  "hero_headline", "hero_subheadline", "hero_cta_primary", "hero_cta_secondary",
  "services_tagline", "services_description", "story_title", "story_text",
  "global_reach_title", "global_reach_text", "testimonials_title",
  "contact_title", "copyright_text", "linkedin_url", "twitter_url",
  "facebook_url", "ios_app_url", "android_app_url"
];

const SECTION_TOGGLE_KEYS = [
  "show_hero", "show_stats", "show_services", "show_standards",
  "show_employer_flow", "show_jobs", "show_story", "show_global_reach",
  "show_testimonials", "show_contact"
];

export async function updateSettings(data: any) {
  const canManageGeneral = await checkPermission("manage_settings");
  const canManageHomepage = await checkPermission("manage_homepage_copy");
  const canManageToggles = await checkPermission("manage_section_toggles");

  if (!canManageGeneral && !canManageHomepage && !canManageToggles) {
    throw new Error("Forbidden: You do not have permission to modify settings.");
  }

  const filteredData: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (canManageGeneral) {
      filteredData[key] = value;
    } else if (canManageHomepage && HOMEPAGE_COPY_KEYS.includes(key)) {
      filteredData[key] = value;
    } else if (canManageToggles && SECTION_TOGGLE_KEYS.includes(key)) {
      filteredData[key] = value;
    }
  }

  if (Object.keys(filteredData).length === 0) {
    throw new Error("Forbidden: You do not have permission to update these fields.");
  }

  try {
    for (const [key, value] of Object.entries(filteredData)) {
      await prisma.content.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw new Error("Failed to save settings.");
  }
}
