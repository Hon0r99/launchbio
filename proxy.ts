import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy function for Next.js 16
 * Handles request interception, authentication checks, and route protection
 * 
 * In Next.js 16, middleware.ts was renamed to proxy.ts to better reflect
 * its role in handling requests at the network boundary.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Set pathname header for layout (if needed)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Protected routes that require authentication
  // Note: /create is NOT protected - anonymous users can create pages
  const protectedRoutes = [
    "/dashboard",
  ];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if the path is an edit route (but not /edit/success)
  // Edit routes require authentication to prevent unauthorized access
  const isEditRoute = pathname.startsWith("/edit/") && !pathname.startsWith("/edit/success");

  // If accessing a protected route or edit route, check for authentication
  if (isProtectedRoute || isEditRoute) {
    // Check for legacy session cookie
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
    // Note: This is a basic check - full validation happens at the page level
    // via getCurrentUser() which validates the session in the database
    if (!legacyToken && !hasNextAuthSession) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to proceed
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configuration for the proxy matcher
 * Defines which routes should be processed by the proxy function
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - including NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
};

