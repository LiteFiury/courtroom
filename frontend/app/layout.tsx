import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CourtRoom AI — Multi-Agent Trial Simulator",
  description:
    "A research platform where autonomous AI agents argue, object, and deliberate inside a fully simulated courtroom.",
  openGraph: {
    title: "CourtRoom AI",
    description: "AI agents on trial — streaming arguments, live objections, autonomous verdicts.",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-court-bg text-court-parchment antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
