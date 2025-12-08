"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function UpgradeButton({ editToken }: { editToken: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editToken }),
        });
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data?.error || "Failed to start checkout");
      } catch (error: any) {
        toast.error(error?.message ?? "Stripe error");
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? "Creating session..." : "Upgrade to Launch Pack — $9"}
    </Button>
  );
}

