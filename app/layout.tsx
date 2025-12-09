import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { SiteHeader } from "@/components/site-header";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchBio — launch link with a countdown",
  description: "Create a beautiful launch link with a big countdown in 5 minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
      >
        <Providers />
        <NavigationWrapper>
          <Suspense fallback={<div className="h-16" />}>
            <SiteHeader />
          </Suspense>
        </NavigationWrapper>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
