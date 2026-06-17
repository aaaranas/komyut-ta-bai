import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import type { Metadata } from "next";
import PlanResults from "./PlanResults";

export const metadata: Metadata = {
  title: "Journey plan — Komyut ta Bai",
};

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm">Planning your journey…</p>
        </main>
      }
    >
      <PlanResults />
    </Suspense>
  );
}
