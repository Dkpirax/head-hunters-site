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

// Composite logo using your uploaded image
export function Logo({
  className,
  size = "md",
}: LogoProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn("inline-flex items-center", className)}>
      <img 
        src="/logo/Logo (4).png" 
        alt="Head Hunters Logo" 
        width={400} 
        height={100} 
        className={cn("w-auto object-contain", sizeClass)}
      />
    </div>
  );
}

// Nav logo for the header
export function NavLogo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img 
        src="/logo/Logo (4).png" 
        alt="Head Hunters Logo" 
        width={400} 
        height={100} 
        className="w-auto h-[32px] md:h-[40px] object-contain"
      />
    </div>
  );
}
