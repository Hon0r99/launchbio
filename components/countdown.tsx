"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInSeconds } from "date-fns";

function formatParts(secondsLeft: number) {
  const days = Math.max(Math.floor(secondsLeft / 86400), 0);
  const hours = Math.max(Math.floor((secondsLeft % 86400) / 3600), 0);
  const minutes = Math.max(Math.floor((secondsLeft % 3600) / 60), 0);
  const seconds = Math.max(secondsLeft % 60, 0);
  return { days, hours, minutes, seconds };
}

export function Countdown({
  target,
  afterLaunchText,
}: {
  target: string | Date;
  afterLaunchText?: string | null;
}) {
  const targetDate = useMemo(
    () => (typeof target === "string" ? new Date(target) : target),
    [target]
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(differenceInSeconds(targetDate, new Date()), 0)
  );

  const isPast = differenceInSeconds(targetDate, new Date()) <= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(differenceInSeconds(targetDate, new Date()), 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isPast) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/40 p-4 text-center text-white">
        <div className="text-2xl font-semibold">✅ Launch is live!</div>
        {afterLaunchText ? (
          <p className="mt-2 text-sm text-white/80">{afterLaunchText}</p>
        ) : null}
      </div>
    );
  }

  const parts = formatParts(secondsLeft);
  const blocks = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid w-full grid-cols-4 gap-3">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="rounded-xl bg-black/40 px-3 py-4 text-center shadow-inner shadow-black/40"
          >
            <div className="text-3xl font-bold tabular-nums text-white">
              {block.value.toString().padStart(2, "0")}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/60">
              {block.label}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/70">
        Target: {targetDate.toLocaleString("en-US")}
      </p>
    </div>
  );
}

