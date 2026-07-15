import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <AlertCircle size={48} className="text-white/20 mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Admin page not found</h1>
      <p className="text-white/40 max-w-md mb-8">
        The page you are looking for doesn't exist or you don't have permission to access it.
      </p>
      <Link to="/admin">
        <Button variant="solid" size="md">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
