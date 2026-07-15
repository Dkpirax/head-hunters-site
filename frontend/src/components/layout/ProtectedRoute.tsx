import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.user) {
          setAuthenticated(true);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#04a891] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
}
