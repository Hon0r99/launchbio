"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavigationWrapperProps {
  children: ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const pathname = usePathname();

  // Navigation should be shown on:
  // - Dashboard (/dashboard)
  // - Editor pages (/edit/*)
  // - Create page (/create)
  // Navigation should NOT be shown on:
  // - Marketing/landing pages (/)
  // - Preview pages (/u/*)
  // - Auth pages (/auth/*)
  const shouldShowNavigation =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/edit/") ||
    pathname === "/create" ||
    pathname.startsWith("/create/");

  if (!shouldShowNavigation) {
    return null;
  }

  return <>{children}</>;
}

