import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variantClass =
      variant === "primary"
        ? "bg-brand-terracotta text-white hover:opacity-95"
        : variant === "secondary"
          ? "bg-brand-olive text-white hover:opacity-95"
          : "bg-transparent text-brand-charcoal hover:bg-brand-sand/20";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-terracotta disabled:pointer-events-none disabled:opacity-60",
          variantClass,
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
