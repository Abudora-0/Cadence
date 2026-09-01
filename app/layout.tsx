import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { DEFAULT_THEME } from "@/lib/themes";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Cadence - find your typing rhythm",
    template: "%s - Cadence",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "typing test",
    "typing trainer",
    "typing practice",
    "wpm test",
    "words per minute",
    "focus mode",
    "keyboard practice",
  ],
  authors: [{ name: "Abudora-0" }],
  creator: "Abudora-0",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Cadence - find your typing rhythm",
    description:
      "A focus-first typing trainer with ambient sound, a live speed graph, a keystroke heatmap, and a ghost race against your past self.",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadence - find your typing rhythm",
    description:
      "A focus-first typing trainer with ambient sound, a live speed graph, and a ghost race against your past self.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Loaded once from the root layout, so it applies to every route. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
