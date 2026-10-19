import type { Metadata } from "next";
import LabConsole from "@/components/lab/LabConsole";

export const metadata: Metadata = {
  title: "Research console — Komyut ta Bai",
  robots: { index: false },
};

export default function LabPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Research console</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Controlled replays, ground-truth labeling, field validation rides, and the evaluation metrics for
        estimate accuracy, propagation time, and verification quality.
      </p>
      <LabConsole />
    </main>
  );
}
