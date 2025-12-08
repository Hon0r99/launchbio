import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Countdown } from "@/components/countdown";
import { Button } from "@/components/ui/button";
import { backgroundPresets, getButtonStyles } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ViewTracker } from "@/components/view-tracker";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) return {};
  return {
    title: `${page.title} — LaunchBio`,
    description: page.description ?? "Launch page with a countdown",
  };
}

export default async function PublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) notFound();

  const bgClass = backgroundPresets[page.bgType as keyof typeof backgroundPresets];
  const buttonStyles = getButtonStyles(page.bgType as any);

  return (
    <div className={cn("min-h-screen px-6 py-12", bgClass)}>
      <ViewTracker slug={page.slug} />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            LaunchBio
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">{page.title}</h1>
          {page.description ? (
            <p className="text-lg text-white/80">{page.description}</p>
          ) : null}
        </div>
        <Countdown target={page.eventDateTime} afterLaunchText={page.afterLaunchText} />

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {(page.buttons ? (JSON.parse(page.buttons) as any[]) : [])?.map(
            (btn: { label: string; url: string }, idx: number) => (
              <Button
                key={`${btn.label}-${idx}`}
                asChild
                variant="ghost"
                className={cn(
                  idx === 0 ? buttonStyles.primary : buttonStyles.secondary
                )}
              >
                <Link href={btn.url} target="_blank" rel="noreferrer">
                  {btn.label}
                </Link>
              </Button>
            )
          )}
        </div>

        {page.showBranding ? (
          <p className="mt-12 text-xs text-white/60">Made with LaunchBio</p>
        ) : null}
      </div>
    </div>
  );
}

