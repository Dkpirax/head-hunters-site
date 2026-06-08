"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-[#02695e] text-white border border-[#02695e] shadow-[0_12px_32px_rgba(2,105,94,0.32)] hover:bg-[#027d6f] hover:shadow-[0_16px_42px_rgba(2,105,94,0.4)] active:scale-[0.98]",
  ghost:
    "bg-white/8 text-white border border-white/12 hover:bg-white/12 hover:border-white/20 active:scale-[0.98]",
  outline:
    "bg-transparent text-[#02695e] border border-[#02695e]/50 hover:bg-[#02695e]/10 hover:border-[#02695e] active:scale-[0.98]",
  danger:
    "bg-red-600/90 text-white border border-red-500/30 hover:bg-red-600 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs font-semibold gap-1.5",
  md: "h-10 px-4 text-sm font-semibold gap-2",
  lg: "h-12 px-6 text-base font-semibold gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[10px] transition-all duration-200 ease-out cursor-pointer select-none whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// ─── Link-as-Button ──────────────────────────────────────────────────────────
interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function LinkButton({
  className,
  variant = "solid",
  size = "md",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] transition-all duration-200 ease-out cursor-pointer select-none whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
