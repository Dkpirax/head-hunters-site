"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const result = await requestPasswordReset(email);

    setLoading(false);

    if (result.success) {
      setMessage("If an account exists, a password reset link has been sent to your email.");
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center px-5">
      <div className="grain" aria-hidden="true" />
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-5">
            <Logo variant="full" color="green" size="lg" />
          </div>
          <h1 className="text-white font-bold text-2xl mb-1.5">Forgot Password</h1>
          <p className="text-white/40 text-sm">Enter your email to reset your admin password</p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-white/10 bg-white/4 backdrop-blur-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@headhunters.com.au"
                  required
                  autoComplete="email"
                  className="w-full h-11 px-4 pr-12 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-[8px] bg-[#02695e]/10 border border-[#02695e]/20 text-[#04a891] text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full h-11 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#027d6f] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-4"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Send Reset Link <Send size={15} /></>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-11 rounded-[10px] border border-white/10 bg-transparent text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-all cursor-pointer mt-2"
            >
              <ArrowLeft size={15} /> Back to Login
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          T &amp; C Applies © 2026 Fenra · Head Hunters Admin
        </p>
      </div>
    </div>
  );
}
