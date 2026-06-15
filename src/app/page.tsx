import { ArrowRight, Bus, Coins, Route, WifiOff } from "lucide-react";
import Link from "next/link";
import JourneySearchForm from "@/components/JourneySearchForm";
import { Card } from "@/components/ui/card";

const FEATURES = [
  { Icon: Route, label: "Multimodal" },
  { Icon: Coins, label: "Fare totals" },
  { Icon: WifiOff, label: "Works offline" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pb-12">
      <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-b from-primary to-primary/80 px-6 pb-14 pt-12 text-center text-primary-foreground">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Bus className="size-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Komyut ta Bai</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-primary-foreground/90">
          Plan jeepney, bus, V-hire &amp; ferry trips across Cebu province —
          with fares, transfers, and times, even offline.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {FEATURES.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"
            >
              <Icon className="size-3.5" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <div className="-mt-7 px-4">
        <Card className="p-5 shadow-lg">
          <JourneySearchForm />
        </Card>
      </div>

      <div className="mt-6 px-4">
        <Link
          href="/routes"
          className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
        >
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Route className="size-5" />
            </span>
            <span className="text-sm font-medium">
              Browse all routes &amp; terminals
            </span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Works offline after your first visit. No signal needed sa bukid.
        </p>
      </div>
    </main>
  );
}
