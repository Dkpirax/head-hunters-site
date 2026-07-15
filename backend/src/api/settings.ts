import { Router } from 'express';
import { db } from "../lib/db";
import { content } from "../db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = Router();

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

settingsRouter.get('/', async (req, res) => {
  try {
    const settings = await db.select().from(content);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      const normalizedKey = s.key.startsWith("settings.") ? s.key.replace("settings.", "") : s.key;
      settingsMap[normalizedKey] = s.value;
    }

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

    const result = { ...defaultSettings };
    for (const key of Object.keys(defaultSettings)) {
      let dbValue = settingsMap[key];
      if (dbValue === undefined) {
        const legacyKey = Object.keys(keyAliases).find((k) => keyAliases[k] === key);
        if (legacyKey && settingsMap[legacyKey] !== undefined) {
          dbValue = settingsMap[legacyKey];
        }
      }

      if (dbValue !== undefined) {
        if (typeof defaultSettings[key as keyof typeof defaultSettings] === "boolean") {
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
    res.json(result);
  } catch (error) {
    console.error("Failed to load settings:", error);
    res.json(defaultSettings);
  }
});
