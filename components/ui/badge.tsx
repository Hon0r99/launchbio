import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variant === "default" && "bg-white/10 text-white border border-white/20",
        variant === "outline" && "border border-white/20 text-white",
        variant === "success" && "bg-emerald-500/20 text-emerald-100 border border-emerald-500/40",
        className
      )}
      {...props}
    />
  );
}

