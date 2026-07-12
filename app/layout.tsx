import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { loadMeta } from "@/lib/data/load";
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
  "A front-office console for NBA roster construction under the 2023 CBA: cap sheet, trade validation with an itemized rule ledger, and player evaluation. Unofficial demo.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-cap-room.vercel.app"),
  title: "THE CAP ROOM · NBA cap console (unofficial demo)",
  description,
  openGraph: {
    title: "THE CAP ROOM",
    description,
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE CAP ROOM",
    description,
    images: ["/og.png"],
  },
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
