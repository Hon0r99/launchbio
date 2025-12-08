import { PageForm } from "@/components/page-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Create page | LaunchBio",
};

export default async function CreatePage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create your launch page</h1>
        <p className="text-white/70">
          Fill the form and get two URLs: a public link and a secret edit link.
        </p>
        {user ? (
          <p className="mt-2 text-sm text-white/60">
            You are signed in as {user.email}. New pages will be attached to your account.
          </p>
        ) : (
          <div className="mt-3 flex gap-3 text-sm text-white/70">
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/register">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <PageForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

