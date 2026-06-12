import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Komyut ta Bai",
  description: "Province-wide multimodal transport planner for Cebu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Komyut ta Bai",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1D9E75",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <OfflineIndicator />
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
            <Link href="/" className="font-bold text-primary">
              Komyut ta Bai
            </Link>
            <div className="flex gap-1">
              <Link
                href="/"
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-600 hover:text-primary"
              >
                Plan
              </Link>
              <Link
                href="/routes"
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-600 hover:text-primary"
              >
                Routes
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
