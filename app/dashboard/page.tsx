import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard | LaunchBio",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const pages = await prisma.page.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Your pages</h1>
          <p className="text-white/70">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/create">Create new page</Link>
          </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-8 text-center text-white/80">
            <p>No pages yet.</p>
            <Button asChild className="mt-4">
              <Link href="/create">Create your first page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.id} className="border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-white line-clamp-1">{page.title}</CardTitle>
                <Badge variant={page.isPro ? "success" : "outline"}>
                  {page.isPro ? "Pro" : "Free"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Public:</span>
                  <Link href={`/u/${page.slug}`} className="text-sky-300 underline" target="_blank">
                    /u/{page.slug}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Editor:</span>
                  <Link href={`/edit/${page.editToken}`} className="text-sky-300 underline">
                    /edit/{page.editToken}
                  </Link>
                </div>
                <div className="text-white/60">Views: {page.views}</div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/edit/${page.editToken}`}>Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/u/${page.slug}`} target="_blank">
                      Open
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

