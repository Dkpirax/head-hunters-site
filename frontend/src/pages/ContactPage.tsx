import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Mail, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'HIRING',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        if (formData.type === 'HIRING') {
          trackEvent('employer_enquiry_submit', { enquiry_type: 'HIRING' });
        } else {
          trackEvent('candidate_application_submit', { enquiry_type: formData.type });
        }
      }
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Header />
      <main className="pt-28 pb-20">
        <section className="max-w-[1200px] mx-auto px-5 py-12">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#04a891] mb-3">
              Consultation & Inquiries • Colombo, Sri Lanka
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Talk to Our Recruitment Team
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Whether you are an employer seeking strategic leadership appointments or a professional exploring confidential career opportunities, our team is ready to assist.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            {/* Form */}
            <div className="p-8 rounded-[16px] bg-[#111413] border border-white/8">
              {submitted ? (
                <div className="py-12 text-center">
                  <CheckCircle2 size={48} className="text-[#04a891] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Thank You</h2>
                  <p className="text-white/70 max-w-md mx-auto">
                    Your inquiry has been received by our senior recruitment team. We will review your message and respond discreetly within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                      I Am Inquiring As:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'HIRING' })}
                        className={`py-3 px-4 rounded-[10px] text-sm font-semibold border transition-all ${
                          formData.type === 'HIRING'
                            ? 'bg-[#02695e] border-[#02695e] text-white'
                            : 'bg-[#161a19] border-white/10 text-white/70 hover:bg-white/5'
                        }`}
                      >
                        An Employer (Hiring)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'CANDIDATE' })}
                        className={`py-3 px-4 rounded-[10px] text-sm font-semibold border transition-all ${
                          formData.type === 'CANDIDATE'
                            ? 'bg-[#02695e] border-[#02695e] text-white'
                            : 'bg-[#161a19] border-white/10 text-white/70 hover:bg-white/5'
                        }`}
                      >
                        A Candidate (Career)
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-[8px] bg-[#161a19] border border-white/10 text-white focus:outline-none focus:border-[#04a891]"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-[8px] bg-[#161a19] border border-white/10 text-white focus:outline-none focus:border-[#04a891]"
                        placeholder="work@company.lk"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-11 px-4 rounded-[8px] bg-[#161a19] border border-white/10 text-white focus:outline-none focus:border-[#04a891]"
                      placeholder="+94 77 XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Your Requirement or Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-4 rounded-[8px] bg-[#161a19] border border-white/10 text-white focus:outline-none focus:border-[#04a891]"
                      placeholder={
                        formData.type === 'HIRING'
                          ? 'Please describe the role, discipline, seniority level, and key requirements...'
                          : 'Please describe your current career focus, qualifications, and target positions...'
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-[10px] bg-[#02695e] text-white font-semibold hover:bg-[#027d6f] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Submitting...' : <><Send size={16} /> Submit Confidential Brief</>}
                  </button>
                </form>
              )}
            </div>

            {/* Direct Contact Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-[14px] bg-[#111413] border border-white/8">
                <h3 className="font-bold text-white text-lg mb-4">Direct Communication</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-[#04a891] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/50 text-xs uppercase font-medium">General & Briefings Email</p>
                      <a href="mailto:info@headhunters.lk" className="text-white font-medium hover:text-[#04a891]">
                        info@headhunters.lk
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[14px] bg-[#111413] border border-white/8">
                <h3 className="font-bold text-white text-base mb-2">Confidentiality Guarantee</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  All employer briefs and candidate CVs received through this form are governed by our privacy policy and strict executive non-disclosure standards.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
