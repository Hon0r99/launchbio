import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "../actions";

export default function LoginPage({ searchParams }: { searchParams: { returnTo?: string } }) {
  const returnTo = searchParams.returnTo || "/dashboard";
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <Card className="w-full border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Log in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={loginAction} className="space-y-4">
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
              Log in
            </Button>
          </form>
          <p className="text-sm text-white/70">
            No account yet?{" "}
            <Link className="text-sky-300 underline" href="/auth/register">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

