import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { DEFAULT_THEME } from "@/lib/themes";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadencce.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cadence - find your typing rhythm",
    template: "%s - Cadence",
  },
  description:
    "Cadence is a focus-first typing trainer. Tune out the noise with ambient sound and a distraction-free surface, watch your speed graph build in real time, and race a ghost of your past self.",
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
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Cadence - find your typing rhythm",
    description:
      "A focus-first typing trainer with ambient sound, a live speed graph, a keystroke heatmap, and a ghost race against your past self.",
    siteName: "Cadence",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadence - find your typing rhythm",
    description:
      "A focus-first typing trainer with ambient sound, a live speed graph, and a ghost race against your past self.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
