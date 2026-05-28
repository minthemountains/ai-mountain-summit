import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatDrawer from "@/components/ChatDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Mountain Summit 2026 — Erkenntnisse & Insights",
  description: "Die wichtigsten Erkenntnisse der AI Mountain Summit Keynotes in Laax, Schweiz – durchsuchbar und per KI erkundbar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-full bg-[#FAFAF8] text-stone-900 antialiased">
        {children}
        <ChatDrawer />
      </body>
    </html>
  );
}
