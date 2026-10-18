import { FlaskConical } from "lucide-react";
import type { Metadata } from "next";
import LabConsole from "@/components/lab/LabConsole";

export const metadata: Metadata = {
  title: "Research console — Komyut ta Bai",
  robots: { index: false },
};

export default function LabPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <FlaskConical className="size-6 text-primary" />
        Research console
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Controlled replays, ground-truth labeling, field validation rides, and the evaluation metrics for
        estimate accuracy, propagation time, and verification quality.
      </p>
      <LabConsole />
    </main>
  );
}
