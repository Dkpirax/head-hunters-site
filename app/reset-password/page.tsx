"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Missing or invalid reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await resetPassword(token, password);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center px-5">
        <div className="text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h1 className="text-white font-bold text-xl mb-2">Invalid Reset Link</h1>
          <p className="text-white/60 mb-6">This password reset link is invalid or missing a token.</p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="px-6 py-2 rounded-[8px] bg-[#02695e] text-white text-sm font-semibold hover:bg-[#027d6f] transition-all"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center px-5">
      <div className="grain" aria-hidden="true" />
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-5">
            <Logo variant="full" color="green" size="lg" />
          </div>
          <h1 className="text-white font-bold text-2xl mb-1.5">Choose New Password</h1>
          <p className="text-white/40 text-sm">Enter a new password for your admin account</p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-white/10 bg-white/4 backdrop-blur-xl p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[#02695e]/20 text-[#04a891] flex items-center justify-center mx-auto mb-4">
                <KeyRound size={24} />
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Password Reset Successfully</h2>
              <p className="text-white/60 text-sm">You can now use your new password to log in. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full h-11 px-4 pr-12 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full h-11 px-4 pr-12 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#027d6f] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-4"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Reset Password</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-[#04a891] rounded-full animate-spin"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
