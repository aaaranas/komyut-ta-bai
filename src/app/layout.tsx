import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Bus } from "lucide-react";
import InstallPrompt from "@/components/InstallPrompt";
import MainNav from "@/components/MainNav";
import OfflineIndicator from "@/components/OfflineIndicator";
import ThemeToggle from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1D9E75" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1d18" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <OfflineIndicator />
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2 font-bold">
                <span className="grid size-8 place-items-center rounded-lg bg-gold text-gold-foreground">
                  <Bus className="size-5" />
                </span>
                <span className="tracking-tight">Komyut ta Bai</span>
              </Link>
              <div className="flex items-center gap-1">
                <MainNav />
                <ThemeToggle />
              </div>
            </div>
          </header>
          {children}
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
