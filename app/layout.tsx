import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import TopBar from "@/components/TopBar";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DC Terminal — US Data Center Intelligence",
  description:
    "US data center inventory — operating, planned, behind-the-meter power, and water, with sourced data and honest coverage disclosure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plexSans.variable} ${plexMono.variable} min-h-screen bg-bg-0 text-fg`}
      >
        <TopBar />
        <main className="mx-auto max-w-[1440px] px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
