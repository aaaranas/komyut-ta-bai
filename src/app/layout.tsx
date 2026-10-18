import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Bus } from "lucide-react";
import { DesktopNav, MobileTabBar } from "@/components/layout/AppNav";
import InstallPrompt from "@/components/layout/InstallPrompt";
import LiveStatusPill from "@/components/layout/LiveStatusPill";
import OfflineIndicator from "@/components/layout/OfflineIndicator";
import RideTrackerBar from "@/components/layout/RideTrackerBar";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ConditionsProvider } from "@/components/providers/ConditionsProvider";
import { RideTrackerProvider } from "@/components/providers/RideTrackerProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Komyut ta Bai",
  description:
    "Multimodal transit planner for Cebu with commuter-reported, verified live conditions.",
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
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E7A6E" },
    { media: "(prefers-color-scheme: dark)", color: "#14242b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans antialiased md:pb-0">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConditionsProvider>
            <RideTrackerProvider>
              <OfflineIndicator />
              <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4">
                  <Link href="/" className="flex items-center gap-2 font-bold">
                    <span className="grid size-8 place-items-center rounded-lg bg-gold text-gold-foreground">
                      <Bus className="size-5" />
                    </span>
                    <span className="tracking-tight">Komyut ta Bai</span>
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <DesktopNav />
                    <LiveStatusPill />
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              {children}
              <RideTrackerBar />
              <MobileTabBar />
              <InstallPrompt />
            </RideTrackerProvider>
          </ConditionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
