import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-brand-sand/70 bg-white px-3 text-sm text-brand-charcoal shadow-sm outline-none ring-brand-terracotta placeholder:text-brand-charcoal/50 focus:ring-2",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
