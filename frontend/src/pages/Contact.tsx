import React, { useState } from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chatbot } from '../components/chatbot/Chatbot';

type Tab = "Hiring" | "Candidate" | "General";

export function ContactPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Hiring");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <>
      <SEO title="Contact Us | Headhunters.lk" description="Get in touch with our team for recruitment solutions or candidate support." />
      <Header />
      <main className="pt-32 pb-20 min-h-[80vh] text-white">
        <div className="px-5 max-w-[1200px] mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-[#04a891]">Let's Talk</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Choose a pathway and send enough context for the first response to be useful. Confidential searches and candidate enquiries are handled with discretion.
          </p>
        </div>
        
        <div className="px-5 max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left: Form */}
          <div className="flex flex-col gap-4">
             <h3 className="text-xl font-semibold">Send an Enquiry</h3>
             <p className="text-sm text-white/50 mb-2">Prefer to leave a detailed message? Use the form below and we'll get back to you during business hours.</p>
            <motion.div
              className="rounded-[20px] border border-white/10 bg-gradient-to-br from-white/6 to-transparent backdrop-blur-xl p-6 md:p-8 flex-1"
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}>
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-5 py-12 text-center h-full min-h-[400px]">
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
                    { id: "contact-phone", label: "Phone (optional)", type: "tel", placeholder: "+94 77 xxx xxxx", required: false },
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

                  <Button type="submit" variant="solid" size="lg" disabled={isSubmitting} className="w-full justify-center gap-2.5">
                    {isSubmitting ? "Sending..." : "Send enquiry"}
                    {!isSubmitting && <Send size={15} />}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Right: Chatbot */}
          <div className="flex flex-col gap-4 h-full">
            <h3 className="text-xl font-semibold">Live Assistant</h3>
            <p className="text-sm text-white/50 mb-2">Our AI assistant can answer most common questions instantly. You can also request a human consultant.</p>
            <div className="relative z-10 w-full h-[600px] max-w-full">
              <Chatbot inline={true} />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
