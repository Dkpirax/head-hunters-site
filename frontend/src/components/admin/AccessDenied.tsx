import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export function AccessDenied({ permission }: { permission: string }) {
  const formatPermissionName = (name: string) => {
    return name
      .replace("manage_", "Manage ")
      .replace("view_", "View ")
      .replace("_", " ");
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <ShieldAlert size={30} strokeWidth={1.8} />
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
      <p className="text-white/50 text-sm max-w-[400px] leading-relaxed mb-6">
        You do not have the required permission <code className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-red-400 text-xs font-mono">{permission}</code> to view this system console. Please request access from a Super Admin if you need to access this area.
      </p>
      <Link
        to="/admin"
        className="px-5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-medium transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
