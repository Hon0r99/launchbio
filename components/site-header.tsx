import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-white">
            LaunchBio
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link href="/create" className="hover:text-white">
              Create
            </Link>
            {user ? (
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-white/70 sm:inline">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

