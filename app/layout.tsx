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

export const metadata: Metadata = {
  title: "THE CAP ROOM · NBA cap console (unofficial demo)",
  description:
    "A front-office console for NBA roster construction under the 2023 CBA: cap sheet, trade validation with an itemized rule ledger, and player evaluation. Unofficial demo.",
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
