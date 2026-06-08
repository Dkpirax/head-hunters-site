"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";

const FAQS = [
  { question: "How fast can Head Hunters respond to a staffing request?", answer: "Sales consultant response is designed around a 1-hour target, with quotes provided within 24 hours where the brief is clear and complete." },
  { question: "Can candidates upload a CV directly?", answer: "Yes. The candidate pathway includes CV upload, online registration, job alerts, career resources and WhatsApp connection options." },
  { question: "Which services are supported?", answer: "Executive search, permanent recruitment, casual labour hire, casual-to-permanent conversion, remote staffing solutions, payroll and bookkeeping support across Australia, New Zealand and Sri Lanka." },
  { question: "Does the platform connect to recruitment systems?", answer: "The platform is designed to integrate with Bullhorn, FoundU, Google Reviews, live chat, Calendly, job alerts and CRM handoff workflows." },
  { question: "How does casual-to-permanent conversion work?", answer: "You start with a flexible casual arrangement. Once you've seen a worker perform, we handle the conversion to permanent employment — paperwork, terms and all." },
  { question: "What is the recruitment fraud policy?", answer: "Head Hunters will never ask candidates for payment to apply for a role. If you receive a suspicious request using our name, contact us directly to verify." },
];

type Tab = "Hiring" | "Candidate" | "General";

export function ContactSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Hiring");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Demo submit — in production this POSTs to /api/contact
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <>
      {/* FAQ */}
      <section id="faq" className="bg-[#0B0B0C] py-28" aria-labelledby="faq-title">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <motion.p className="eyebrow mb-4"
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>FAQ</motion.p>
              <motion.h2
                id="faq-title"
                className="text-[clamp(30px,4.5vw,54px)] font-black text-white leading-[0.95] tracking-tight"
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                Clear answers before a consultant steps in.
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
              <Accordion items={FAQS} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[#111413] py-28 border-t border-white/6" aria-labelledby="contact-title">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <motion.p className="eyebrow mb-4"
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>Contact</motion.p>
              <motion.h2
                id="contact-title"
                className="text-[clamp(32px,5vw,60px)] font-black text-white leading-[0.95] tracking-tight mb-5"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                Need to hire well, and quickly? Let us talk.
              </motion.h2>
              <motion.p className="text-white/55 text-[17px] leading-relaxed mb-8"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                Choose a pathway and send enough context for the first response to be useful. Confidential searches and candidate enquiries are handled with discretion.
              </motion.p>

              <motion.div className="space-y-3"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
                {[
                  { icon: "✉", label: "hello@headhunters.com.au", href: "mailto:hello@headhunters.com.au" },
                  { icon: "💬", label: "WhatsApp support line", href: "/#contact" },
                  { icon: "📅", label: "Book a consultant call", href: "/#contact" },
                ].map((item) => (
                  <a key={item.label} href={item.href}
                    className="flex items-center gap-3 p-4 rounded-[12px] border border-white/6 bg-white/3 text-white/70 hover:text-white hover:border-[#04a891]/40 hover:bg-white/5 transition-all duration-200 text-sm font-medium">
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </motion.div>

              <motion.p
                className="mt-8 text-xs text-white/30 leading-relaxed p-4 rounded-[10px] border border-white/6"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
                🔒 Recruitment fraud notice: Head Hunters will never ask candidates for payment to apply for a role. Report suspicious activity immediately.
              </motion.p>
            </div>

            {/* Right: form */}
            <motion.div
              className="rounded-[20px] border border-white/10 bg-gradient-to-br from-white/6 to-transparent backdrop-blur-xl p-8"
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#02695e]/20 border border-[#04a891]/30 grid place-items-center">
                    <CheckCircle size={28} className="text-[#04a891]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">Enquiry received</h3>
                    <p className="text-white/55 text-sm">A consultant will respond within 1 hour during business hours.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" aria-label="Contact form">
                  {/* Tab selector */}
                  <div className="flex gap-1 p-1 rounded-[10px] bg-white/5 border border-white/8">
                    {(["Hiring", "Candidate", "General"] as Tab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 rounded-[8px] text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          activeTab === tab
                            ? "bg-[#02695e] text-white shadow-[0_4px_16px_rgba(2,105,94,0.3)]"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {[
                    { id: "contact-name", label: "Name", type: "text", placeholder: "Your full name", required: true },
                    { id: "contact-email", label: "Email", type: "email", placeholder: "you@company.com", required: true },
                    { id: "contact-phone", label: "Phone (optional)", type: "tel", placeholder: "+61 4xx xxx xxx", required: false },
                  ].map((field) => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 focus:bg-white/8 outline-none transition-all duration-200"
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder={
                        activeTab === "Hiring"
                          ? "Tell us the role, headcount, location and start date..."
                          : activeTab === "Candidate"
                          ? "Tell us about your experience, preferred roles and availability..."
                          : "What can we help you with?"
                      }
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 focus:bg-white/8 outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  <Button type="submit" variant="solid" size="lg" className="w-full justify-center gap-2.5">
                    Send enquiry
                    <Send size={15} />
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
