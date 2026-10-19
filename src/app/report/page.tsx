import type { Metadata } from "next";
import { Suspense } from "react";
import ReportFlow from "@/components/report/ReportFlow";

export const metadata: Metadata = {
  title: "Report — Komyut ta Bai",
};

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16 pt-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Report a problem</h1>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        Your report is checked against others before it changes anyone&apos;s route. You can withdraw it any time.
      </p>
      <Suspense fallback={null}>
        <ReportFlow />
      </Suspense>
    </main>
  );
}
