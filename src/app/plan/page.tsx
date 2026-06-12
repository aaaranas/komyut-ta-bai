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
        <main className="mx-auto w-full max-w-md px-4 py-10 text-center text-gray-500">
          Planning your journey…
        </main>
      }
    >
      <PlanResults />
    </Suspense>
  );
}
