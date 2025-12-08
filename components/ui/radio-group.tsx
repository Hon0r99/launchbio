import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioItem {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  items: RadioItem[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export function RadioGroupCard({ items, value, onChange, name }: RadioGroupProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const selected = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-xl border bg-white/5 p-4 text-left transition hover:border-white/40",
              selected
                ? "border-sky-400/70 shadow-[0_10px_50px_-25px_rgba(56,189,248,0.9)]"
                : "border-white/10"
            )}
            aria-pressed={selected}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <span
                className={cn(
                  "h-4 w-4 rounded-full border border-white/40",
                  selected && "border-sky-400 bg-sky-400"
                )}
                aria-hidden
              />
            </div>
            {item.description ? (
              <p className="mt-2 text-xs text-white/70">{item.description}</p>
            ) : null}
            <input
              type="radio"
              name={name}
              className="sr-only"
              value={item.value}
              checked={selected}
              onChange={() => onChange(item.value)}
            />
          </button>
        );
      })}
    </div>
  );
}

