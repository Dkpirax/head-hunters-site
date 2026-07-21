import { cn } from "@/lib/utils";


interface LogoProps {
  className?: string;
  variant?: "full" | "mark" | "wordmark";
  color?: "green" | "white" | "black";
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-[24px]",
  md: "h-[36px]",
  lg: "h-[48px]",
  xl: "h-[64px]",
};

// Main logo - uses the white wordmark for dark backgrounds
export function Logo({
  className,
  size = "md",
}: LogoProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <img 
        src="/logo/logo-white.png" 
        alt="Head Hunters Logo" 
        width={400} 
        height={100} 
        className={cn("w-auto object-contain block", sizeClass)}
      />
    </div>
  );
}

// Nav logo for the header - uses white wordmark on dark header
export function NavLogo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img 
        src="/logo/logo-white.png" 
        alt="Head Hunters Logo" 
        width={400} 
        height={124} 
        className="w-auto h-[26px] sm:h-[30px] md:h-[32px] object-contain block"
      />
    </div>
  );
}

// H-mark icon for small UI elements (chatbot avatar, favicon-like uses)
export function HMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <img
      src="/logo/favicon-mark.png"
      alt="HH Mark"
      width={size}
      height={size}
      className={cn("object-contain rounded-lg", className)}
    />
  );
}
