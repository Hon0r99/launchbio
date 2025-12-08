import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive";
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "default" && "border-white/15 bg-white/5 text-white",
        variant === "success" &&
          "border-emerald-500/50 bg-emerald-500/10 text-emerald-50",
        variant === "destructive" &&
          "border-rose-500/50 bg-rose-500/10 text-rose-50",
        className
      )}
      {...props}
    />
  );
}

