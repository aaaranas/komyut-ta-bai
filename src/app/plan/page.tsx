import type { Metadata } from "next";
import { Suspense } from "react";
import PlanView from "@/components/plan/PlanView";

export const metadata: Metadata = {
  title: "Journey plan — Komyut ta Bai",
};

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-5xl px-4 pt-8 text-sm text-muted-foreground">Planning your trip…</main>
      }
    >
      <PlanView />
    </Suspense>
  );
}
