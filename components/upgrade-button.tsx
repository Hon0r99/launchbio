"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function UpgradeButton({
  editToken,
  isAuthenticated = false,
}: {
  editToken: string;
  isAuthenticated?: boolean;
}) {
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/auth/login?returnTo=/edit/${editToken}`}>Log in to upgrade</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/auth/register?returnTo=/edit/${editToken}`}>Sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? "Creating session..." : "Upgrade to Launch Pack — $9"}
    </Button>
  );
}

