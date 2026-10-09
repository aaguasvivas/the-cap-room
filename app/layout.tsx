import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { loadMeta } from "@/lib/data/load";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const description =
  "A front-office console for NBA roster construction under the 2023 CBA: a trade machine whose verdicts explain themselves rule by rule, cap sheets against the five lines, and league-percentile player evaluation. Unofficial demo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "The Cap Room · NBA salary cap console",
    template: "%s · The Cap Room",
  },
  description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: SITE.authorUrl }],
  creator: SITE.author,
  keywords: ["NBA", "salary cap", "CBA", "trade machine", "second apron", "Stepien rule", "Next.js", "TypeScript"],
  openGraph: {
    title: "The Cap Room · the trade machine that shows its work",
    description,
    type: "website",
    siteName: SITE.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Cap Room: a trade verdict stamped LEGAL beside a salary gauge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cap Room · the trade machine that shows its work",
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#17161A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AppShell meta={loadMeta()}>{children}</AppShell>
      </body>
    </html>
  );
}
