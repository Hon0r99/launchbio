import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageForm } from "@/components/page-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/upgrade-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditPage({
  params,
}: {
  params: { editToken: string };
}) {
  const page = await prisma.page.findUnique({
    where: { editToken: params.editToken },
  });

  if (!page) notFound();

  const initialValues = {
    title: page.title,
    description: page.description,
    eventDateTime: page.eventDateTime.toISOString(),
    bgType: page.bgType as any,
    buttons: page.buttons ? (JSON.parse(page.buttons) as any[]) : [],
    ownerEmail: page.ownerEmail,
    afterLaunchText: page.afterLaunchText,
    analyticsId: page.analyticsId,
    showBranding: page.showBranding,
    isPro: page.isPro,
    slug: page.slug,
    editToken: page.editToken,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Editor</h1>
          <p className="text-white/70">Secret access via token</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/u/${page.slug}`}>Public /u/{page.slug}</Link>
          </Button>
          {!page.isPro ? <UpgradeButton editToken={page.editToken} /> : null}
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-white">Page data</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-white/70">
            <Badge variant={page.isPro ? "success" : "outline"}>
              {page.isPro ? "Launch Pack active" : "Free"}
            </Badge>
            <span>Views: {page.views}</span>
            <span className="truncate">Token: {page.editToken}</span>
          </div>
        </CardHeader>
        <CardContent>
          <PageForm mode="edit" initialValues={initialValues as any} editToken={page.editToken} />
        </CardContent>
      </Card>
    </div>
  );
}

