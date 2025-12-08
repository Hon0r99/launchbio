import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerAction } from "../actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.returnTo || "/dashboard";
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <Card className="w-full border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={registerAction} className="space-y-4">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
          <p className="text-sm text-white/70">
            Already have an account?{" "}
            <Link className="text-sky-300 underline" href="/auth/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

