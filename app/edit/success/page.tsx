import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ editToken?: string }>;
}) {
  const params = await searchParams;
  const editToken = params.editToken;
  // Note: Pro status is activated via Stripe webhook, not here
  // This page just displays the success message
  const page = editToken
    ? await prisma.page.findUnique({
        where: { editToken },
      })
    : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
      <Card className="w-full bg-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            🎉 Payment successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-white/80">
          <p>Launch Pack is active. Branding is off and extra options are available.</p>
          {page ? (
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm">
              <div className="font-semibold text-white">Page: {page.title}</div>
              <div className="text-white/70">Public: /u/{page.slug}</div>
              <div className="text-white/70">Edit token: {page.editToken}</div>
            </div>
          ) : (
            <p className="text-sm text-rose-200">
              Could not find a page by this token. Please contact support.
            </p>
          )}
          {editToken ? (
            <div className="flex flex-wrap gap-3">
            <Button asChild>
                <Link href={`/edit/${editToken}`}>Back to editor</Link>
              </Button>
              {page ? (
              <Button asChild variant="outline">
                <Link href={`/u/${page.slug}`}>Open public page</Link>
            </Button>
            ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

