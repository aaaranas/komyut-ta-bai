import { Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import ReportFlow from "@/components/report/ReportFlow";

export const metadata: Metadata = {
  title: "Report a condition — Komyut ta Bai",
};

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-12 pt-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Megaphone className="size-6 text-primary" />
        Report a condition
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Help other commuters. Reports are checked against others before they change anyone&apos;s route, and you
        can withdraw yours any time.
      </p>
      <Suspense fallback={null}>
        <ReportFlow />
      </Suspense>
    </main>
  );
}
