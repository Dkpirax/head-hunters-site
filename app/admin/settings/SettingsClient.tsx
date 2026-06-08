"use client";

import React, { useState } from "react";
import { Save, Globe, Mail, MessageSquare, Shield, Power, CheckCircle, AlertCircle } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsData {
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
}

export default function SettingsClient({ initialSettings }: { initialSettings: SettingsData }) {
  const [formData, setFormData] = useState<SettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<"site" | "email" | "chat" | "security" | "integrations">("site");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      await updateSettings(formData);
      setStatus({ type: "success", message: "Settings saved successfully! Changes are now live." });
      
      // Auto dismiss success notification
      setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to update configuration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "site" as const, label: "Site Config", icon: Globe },
    { id: "email" as const, label: "Email Alerts", icon: Mail },
    { id: "chat" as const, label: "Chat Assistant", icon: MessageSquare },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "integrations" as const, label: "Integrations", icon: Power },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">General Settings</h1>
        <p className="text-white/40 text-sm">
          Configure global site behaviour, feature toggles, notifications, and third-party integrations.
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
          <div className="bg-white/3 border border-white/8 rounded-[16px] p-6 min-h-[360px] flex flex-col justify-between">
            {/* TAB: Site config */}
            {activeTab === "site" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Site Configuration</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Site Name</label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, siteName: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="Head Hunters"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Logo Preview Placeholder</label>
                  <div className="p-4 border border-dashed border-white/10 rounded-[10px] bg-white/2 flex items-center justify-between">
                    <span className="text-xs text-white/40 font-mono">logo.png / svg</span>
                    <span className="text-[10px] bg-[#02695e]/20 text-[#04a891] px-2 py-0.5 rounded-[4px] font-bold">Default Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Email alerts */}
            {activeTab === "email" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Email Notifications</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Notification Recipients</label>
                  <input
                    type="text"
                    value={formData.notifyEmails}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notifyEmails: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="hello@headhunters.com.au"
                    required
                  />
                  <p className="text-[10px] text-white/30 pt-0.5 leading-relaxed">
                    Enter comma-separated emails. New enquiries and takeover notifications will target these addresses.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: Chat config */}
            {activeTab === "chat" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Chatbot Assistant</h3>
                
                <div className="flex items-center justify-between p-3.5 border border-white/8 rounded-[10px] bg-white/2">
                  <div>
                    <p className="text-xs font-bold text-white">Enable Human Takeover</p>
                    <p className="text-[10px] text-white/35">Allow administrators to taking over live chat sessions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.humanTakeoverEnabled}
                    onChange={(e) => setFormData((prev) => ({ ...prev, humanTakeoverEnabled: e.target.checked }))}
                    className="w-4 h-4 text-[#04a891] border-white/10 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 border border-white/8 rounded-[10px] bg-white/2">
                  <div>
                    <p className="text-xs font-bold text-white">Enable Typing Indicator</p>
                    <p className="text-[10px] text-white/35">Render realistic typing animations during conversations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.typingIndicatorEnabled}
                    onChange={(e) => setFormData((prev) => ({ ...prev, typingIndicatorEnabled: e.target.checked }))}
                    className="w-4 h-4 text-[#04a891] border-white/10 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Bot Auto-Reply Delay (ms)</label>
                  <input
                    type="number"
                    value={formData.autoReplyDelay}
                    onChange={(e) => setFormData((prev) => ({ ...prev, autoReplyDelay: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Offline Message</label>
                  <input
                    type="text"
                    value={formData.offlineMessage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, offlineMessage: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="We'll get back soon"
                    required
                  />
                </div>
              </div>
            )}

            {/* TAB: Security limits */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Security & Thresholds</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Enquiries rate limit (per hour)</label>
                  <input
                    type="number"
                    value={formData.rateLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rateLimit: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="10"
                    required
                  />
                  <p className="text-[10px] text-white/30 pt-0.5">
                    Restricts the maximum number of enquiry submissions allowed from a single client IP address per hour.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: Integrations */}
            {activeTab === "integrations" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Integrations</h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">WhatsApp Business Phone</label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="+61400000000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Calendly URL</label>
                  <input
                    type="text"
                    value={formData.calendlyLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, calendlyLink: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all"
                    placeholder="https://calendly.com/headhunters/15min"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Bullhorn API Mode</label>
                  <select
                    value={formData.bullhornMode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bullhornMode: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[10px] border border-white/8 bg-[#181a19] text-white text-xs focus:border-[#04a891]/50 outline-none transition-all"
                  >
                    <option value="off">Off (Static Database Only)</option>
                    <option value="sandbox">Sandbox Testing</option>
                    <option value="live">Live Production</option>
                  </select>
                </div>
              </div>
            )}

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
