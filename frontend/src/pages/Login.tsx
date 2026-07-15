import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Eye, EyeOff, LogIn } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Invalid credentials. Please check your email and password.");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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
          <h1 className="text-white font-bold text-2xl mb-1.5">Admin portal</h1>
          <p className="text-white/40 text-sm">Head Hunters workforce management system</p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-white/10 bg-white/4 backdrop-blur-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@headhunters.com.au"
                required
                autoComplete="email"
                className="w-full h-11 px-4 rounded-[10px] border border-white/10 bg-white/6 text-white placeholder:text-white/25 text-sm focus:border-[#04a891]/60 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-white/45 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
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

            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-[10px] bg-[#02695e] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#027d6f] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <LogIn size={15} /></>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          T &amp; C Applies © 2026 Fenra · Head Hunters Admin
        </p>
      </div>
    </div>
  );
}
