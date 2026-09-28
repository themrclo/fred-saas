import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm",
          variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
          variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100",
          variant === "danger" && "bg-rose-600 text-white hover:bg-rose-500",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-5 py-2.5 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
