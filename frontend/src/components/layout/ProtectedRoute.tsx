import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiClient } from "@/lib/api";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await apiClient("/api/auth/session");
        if (data.user) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center gap-4 relative z-50">
        <div className="w-10 h-10 border-4 border-[#04a891] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/50 text-sm font-medium">Checking your session...</p>
      </div>
    );
  }

  return authenticated ? <>{children}</> : <Navigate to="/login" replace state={{ from: location }} />;
}
