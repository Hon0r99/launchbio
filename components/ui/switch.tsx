import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition peer-checked:bg-sky-500",
            className
          )}
        >
          <span
            className={cn(
              "absolute left-1 h-4 w-4 rounded-full bg-white transition",
              props.checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </span>
      </label>
    );
  }
);
Switch.displayName = "Switch";

