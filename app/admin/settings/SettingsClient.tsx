"use client";

import React, { useState } from "react";
import { Save, FileText, ToggleLeft, Settings as SettingsIcon, CheckCircle, AlertCircle } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsData {
  site_name: string;
  chatbot_greeting: string;
  offline_message: string;
  auto_reply_delay: string;
  rate_limit: string;

  // Homepage copy
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  services_tagline: string;
  services_description: string;
  story_title: string;
  story_text: string;
  global_reach_title: string;
  global_reach_text: string;
  testimonials_title: string;
  contact_title: string;
  copyright_text: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  ios_app_url: string;
  android_app_url: string;

  // Section toggles
  show_hero: boolean;
  show_stats: boolean;
  show_services: boolean;
  show_standards: boolean;
  show_employer_flow: boolean;
  show_jobs: boolean;
  show_story: boolean;
  show_global_reach: boolean;
  show_testimonials: boolean;
  show_contact: boolean;

  // Feature Flags
  flag_chatbot_enabled: boolean;
  flag_hybrid_chat_enabled: boolean;
  flag_rate_limiting_enabled: boolean;
  flag_live_jobs_enabled: boolean;

  // Email Config
  email_notify_list: string;
  email_from_address: string;

  // Integrations
  integration_whatsapp_number: string;
  integration_calendly_url: string;
  integration_google_reviews_embed: string;
  integration_bullhorn_enabled: boolean;
  integration_bullhorn_api_url: string;
  integration_bullhorn_client_id: string;
}

type TabType = "homepage" | "toggles" | "general";

export default function SettingsClient({ initialSettings }: { initialSettings: SettingsData }) {
  const [formData, setFormData] = useState<SettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<TabType>("homepage");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      await updateSettings(formData);
      setStatus({ type: "success", message: "Settings saved successfully! Changes are now live." });
      setTimeout(() => setStatus({ type: null, message: "" }), 5000);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to update configuration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (key: keyof SettingsData) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tabs = [
    { id: "homepage" as const, label: "Homepage Copy", icon: FileText },
    { id: "toggles" as const, label: "Section Toggles", icon: ToggleLeft },
    { id: "general" as const, label: "General Settings", icon: SettingsIcon },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">General Settings</h1>
        <p className="text-white/40 text-sm">
          Configure site content copy, toggle active features, and manage recruitment platforms.
        </p>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4.5 rounded-[12px] flex items-center gap-3 text-sm font-semibold border ${
              status.type === "success"
                ? "bg-[#02695e]/15 border-[#04a891]/25 text-[#04a891]"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {status.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid md:grid-cols-[220px_1fr] gap-6 items-start">
          {/* Tab Sidebar */}
          <div className="flex md:flex-col gap-1 overflow-x-auto shrink-0 bg-white/3 border border-white/8 rounded-[16px] p-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#02695e] text-white shadow-md"
                      : "text-white/50 hover:text-white hover:bg-white/4"
                  }`}
                >
                  <Icon size={14} className={isSelected ? "text-white" : "text-white/40"} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Form Content panel */}
          <div className="bg-white/3 border border-white/8 rounded-[16px] p-6 min-h-[420px] flex flex-col justify-between">
            <div>
              {/* TAB: Homepage Copy */}
              {activeTab === "homepage" && (
                <div className="space-y-4 pr-2">
                  <h3 className="text-sm font-bold text-white mb-2">Homepage Copy Settings</h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Hero Headline</label>
                      <input
                        type="text"
                        value={formData.hero_headline}
                        onChange={(e) => setFormData((prev) => ({ ...prev, hero_headline: e.target.value }))}
                        className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Hero Subheadline</label>
                      <textarea
                        value={formData.hero_subheadline}
                        onChange={(e) => setFormData((prev) => ({ ...prev, hero_subheadline: e.target.value }))}
                        rows={2}
                        className="w-full p-3.5 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Primary CTA Label</label>
                        <input
                          type="text"
                          value={formData.hero_cta_primary}
                          onChange={(e) => setFormData((prev) => ({ ...prev, hero_cta_primary: e.target.value }))}
                          className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Secondary CTA Label</label>
                        <input
                          type="text"
                          value={formData.hero_cta_secondary}
                          onChange={(e) => setFormData((prev) => ({ ...prev, hero_cta_secondary: e.target.value }))}
                          className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/6 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Our Services Copy</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Services Tagline</label>
                          <input
                            type="text"
                            value={formData.services_tagline}
                            onChange={(e) => setFormData((prev) => ({ ...prev, services_tagline: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Services Description</label>
                          <textarea
                            value={formData.services_description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, services_description: e.target.value }))}
                            rows={2}
                            className="w-full p-3.5 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/6 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Founder Story Copy</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Story Title</label>
                          <input
                            type="text"
                            value={formData.story_title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, story_title: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Story Description Text</label>
                          <textarea
                            value={formData.story_text}
                            onChange={(e) => setFormData((prev) => ({ ...prev, story_text: e.target.value }))}
                            rows={3}
                            className="w-full p-3.5 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/6 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Global Reach Section</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Global Reach Title</label>
                          <input
                            type="text"
                            value={formData.global_reach_title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, global_reach_title: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Global Reach Text</label>
                          <textarea
                            value={formData.global_reach_text}
                            onChange={(e) => setFormData((prev) => ({ ...prev, global_reach_text: e.target.value }))}
                            rows={2}
                            className="w-full p-3.5 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/6 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Testimonials & Contact Headers</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Testimonials Section Title</label>
                          <input
                            type="text"
                            value={formData.testimonials_title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, testimonials_title: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Contact Section Title</label>
                          <input
                            type="text"
                            value={formData.contact_title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, contact_title: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/6 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Socials & Mobile Apps</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">LinkedIn URL</label>
                          <input
                            type="url"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                            placeholder="https://linkedin.com/company/headhunters"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Twitter URL</label>
                          <input
                            type="url"
                            value={formData.twitter_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, twitter_url: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                            placeholder="https://twitter.com/headhunters"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Facebook URL</label>
                          <input
                            type="url"
                            value={formData.facebook_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, facebook_url: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                            placeholder="https://facebook.com/headhunters"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Copyright Notice</label>
                          <input
                            type="text"
                            value={formData.copyright_text}
                            onChange={(e) => setFormData((prev) => ({ ...prev, copyright_text: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">iOS App Store URL</label>
                          <input
                            type="url"
                            value={formData.ios_app_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, ios_app_url: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Android Play Store URL</label>
                          <input
                            type="url"
                            value={formData.android_app_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, android_app_url: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Section Toggles */}
              {activeTab === "toggles" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white mb-2">Homepage Visibility Toggles</h3>
                  <p className="text-[10px] text-white/35 leading-relaxed mb-4">
                    Enable or disable specific sections on the public-facing homepage instantly without redeploying code.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {[
                      { key: "show_hero" as const, label: "Hero Banner" },
                      { key: "show_stats" as const, label: "Stats & Proof Strip" },
                      { key: "show_services" as const, label: "Services Bento Grid" },
                      { key: "show_standards" as const, label: "Recruitment Standards" },
                      { key: "show_employer_flow" as const, label: "Employer Workspace" },
                      { key: "show_jobs" as const, label: "Job Listing Board" },
                      { key: "show_story" as const, label: "Founder Story" },
                      { key: "show_global_reach" as const, label: "Global Reach Map" },
                      { key: "show_testimonials" as const, label: "Client Testimonials" },
                      { key: "show_contact" as const, label: "Contact Form Section" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3.5 border border-white/8 rounded-[10px] bg-white/2 hover:border-white/12 transition-all">
                        <span className="text-xs font-semibold text-white">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={formData[item.key]}
                          onChange={() => handleCheckboxChange(item.key)}
                          className="w-4 h-4 text-[#04a891] border-white/10 rounded cursor-pointer accent-[#02695e]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: General Settings */}
              {activeTab === "general" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-white mb-2">General Configurations</h3>

                  {/* Site Name & Chatbot settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Site Name</label>
                      <input
                        type="text"
                        value={formData.site_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, site_name: e.target.value }))}
                        className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Chatbot Greeting Message</label>
                      <input
                        type="text"
                        value={formData.chatbot_greeting}
                        onChange={(e) => setFormData((prev) => ({ ...prev, chatbot_greeting: e.target.value }))}
                        className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Feature Flags */}
                  <div className="border-t border-white/6 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Feature Flags</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { key: "flag_chatbot_enabled" as const, label: "Chatbot Enabled" },
                        { key: "flag_hybrid_chat_enabled" as const, label: "Hybrid Chat (Human Takeover)" },
                        { key: "flag_rate_limiting_enabled" as const, label: "Rate Limiting Enabled" },
                        { key: "flag_live_jobs_enabled" as const, label: "Live Jobs (Bullhorn API)" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border border-white/8 rounded-[10px] bg-white/2">
                          <span className="text-xs font-medium text-white">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={formData[item.key]}
                            onChange={() => handleCheckboxChange(item.key)}
                            className="w-4 h-4 text-[#04a891] border-white/10 rounded cursor-pointer accent-[#02695e]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Config */}
                  <div className="border-t border-white/6 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Email Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Notification Recipients (comma separated)</label>
                        <input
                          type="text"
                          value={formData.email_notify_list}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email_notify_list: e.target.value }))}
                          className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">From Email Address</label>
                        <input
                          type="email"
                          value={formData.email_from_address}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email_from_address: e.target.value }))}
                          className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chatbot specific configurations */}
                  <div className="border-t border-white/6 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Chat Assistant Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Auto-Reply Delay (ms)</label>
                        <input
                          type="number"
                          value={formData.auto_reply_delay}
                          onChange={(e) => setFormData((prev) => ({ ...prev, auto_reply_delay: e.target.value }))}
                          className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Offline Message</label>
                        <input
                          type="text"
                          value={formData.offline_message}
                          onChange={(e) => setFormData((prev) => ({ ...prev, offline_message: e.target.value }))}
                          className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Integrations detail info */}
                  <div className="border-t border-white/6 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Integrations & Security</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">WhatsApp Business Phone</label>
                          <input
                            type="text"
                            value={formData.integration_whatsapp_number}
                            onChange={(e) => setFormData((prev) => ({ ...prev, integration_whatsapp_number: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                            placeholder="+61400000000"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Calendly URL</label>
                          <input
                            type="url"
                            value={formData.integration_calendly_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, integration_calendly_url: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Google Reviews Embed ID / Place ID</label>
                          <input
                            type="text"
                            value={formData.integration_google_reviews_embed}
                            onChange={(e) => setFormData((prev) => ({ ...prev, integration_google_reviews_embed: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Enquiries Rate Limit (per hour)</label>
                          <input
                            type="number"
                            value={formData.rate_limit}
                            onChange={(e) => setFormData((prev) => ({ ...prev, rate_limit: e.target.value }))}
                            className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-4 border border-white/8 rounded-[12px] bg-white/2 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Bullhorn ATS Integration</span>
                          <input
                            type="checkbox"
                            checked={formData.integration_bullhorn_enabled}
                            onChange={() => handleCheckboxChange("integration_bullhorn_enabled")}
                            className="w-4 h-4 text-[#04a891] border-white/10 rounded cursor-pointer accent-[#02695e]"
                          />
                        </div>
                        {formData.integration_bullhorn_enabled && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Bullhorn API URL</label>
                              <input
                                type="text"
                                value={formData.integration_bullhorn_api_url}
                                onChange={(e) => setFormData((prev) => ({ ...prev, integration_bullhorn_api_url: e.target.value }))}
                                className="w-full h-8.5 px-3.5 rounded-[8px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                                placeholder="https://rest.bullhornstaffing.com"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Bullhorn Client ID</label>
                              <input
                                type="text"
                                value={formData.integration_bullhorn_client_id}
                                onChange={(e) => setFormData((prev) => ({ ...prev, integration_bullhorn_client_id: e.target.value }))}
                                className="w-full h-8.5 px-3.5 rounded-[8px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="mt-8 pt-4 border-t border-white/6 flex justify-end shrink-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-[10px] bg-[#02695e] hover:bg-[#027d6f] text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(2,105,94,0.2)]"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={13} /> Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
