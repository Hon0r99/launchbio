import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Set pathname header for layout
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Protect dashboard route - require authentication
  // Note: We only check for session cookies here because Prisma doesn't work in Edge Runtime
  // Full authentication is verified at the page level in dashboard/page.tsx via getCurrentUser()
  if (pathname.startsWith("/dashboard")) {
    const legacyToken = request.cookies.get("lb_session")?.value;
    // NextAuth v5 uses these cookie names (check common variants)
    const nextAuthCookies = [
      "authjs.session-token",
      "__Secure-authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
    ];
    const hasNextAuthSession = nextAuthCookies.some(
      (name) => request.cookies.get(name)?.value
    );
    
    // If neither session cookie exists, redirect to login
    // This is a basic check - full validation happens in the page component
    if (!legacyToken && !hasNextAuthSession) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

