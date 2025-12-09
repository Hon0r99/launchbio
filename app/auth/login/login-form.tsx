"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { loginAction, type AuthActionResult } from "../actions";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    loginAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      {state && !state.success && (
        <Alert variant="destructive">{state.error}</Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required disabled={isPending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required disabled={isPending} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Log in"}
      </Button>
    </form>
  );
}

