import { ArrowRight, Route, ShieldCheck, Users, Waypoints } from "lucide-react";
import Link from "next/link";
import LiveConditionsStrip from "@/components/home/LiveConditionsStrip";
import MapBackdrop from "@/components/home/MapBackdrop";
import RouteBackdrop from "@/components/home/RouteBackdrop";
import JourneySearchForm from "@/components/search/JourneySearchForm";
import { Card } from "@/components/ui/card";
import { routes, stops } from "@/core/transit/catalog";
import { MODE_CONFIG, MODE_ORDER } from "@/lib/presentation";

const FEATURES = [
  { Icon: Waypoints, label: "Multimodal" },
  { Icon: Users, label: "Commuter-reported" },
  { Icon: ShieldCheck, label: "Verified before shown" },
];

/** Dataset figures, computed at build time. */
const STATS = [
  { value: routes.length, label: "routes" },
  { value: stops.length, label: "stops" },
  { value: new Set(stops.map((stop) => stop.municipality)).size, label: "towns & cities" },
];

export default function Home() {
  return (
    <main className="bg-landing relative isolate flex flex-1 flex-col lg:justify-center">
      <MapBackdrop />
      <div className="mx-auto w-full max-w-6xl pb-12 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10 lg:px-6 lg:py-10">
        <section className="relative isolate overflow-hidden rounded-b-3xl bg-gradient-to-b from-primary to-primary/80 px-6 pb-14 pt-12 text-center text-primary-foreground lg:flex lg:flex-col lg:justify-center lg:rounded-3xl lg:py-16 lg:text-left">
          <RouteBackdrop />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Asa ta, bai?</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">Komyut ta Bai</h1>
          <p className="mx-auto mt-2 max-w-sm text-balance text-sm text-primary-foreground/90 lg:mx-0 lg:max-w-md lg:text-base">
            Trip plans across Cebu&apos;s jeepneys, MyBus, V-hires, provincial buses, and ferries — adjusted by
            delays, flooding, and full rides that fellow commuters report and the app verifies.
          </p>

          <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {MODE_ORDER.map((mode) => {
              const { Icon, label } = MODE_CONFIG[mode];
              return (
                <li
                  key={mode}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-medium ring-1 ring-white/15 backdrop-blur"
                >
                  <Icon className="size-3.5 text-gold" />
                  {label}
                </li>
              );
            })}
          </ul>

          <dl className="mt-7 flex justify-center gap-7 lg:justify-start">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dt className="text-2xl font-bold leading-none tabular-nums">{value}</dt>
                <dd className="mt-1 text-xs text-primary-foreground/75">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="-mt-7 px-4 lg:mt-0 lg:px-0">
          <Card className="p-5 shadow-lg">
            <JourneySearchForm />
          </Card>

          <LiveConditionsStrip />

          <Link
            href="/routes"
            className="mt-3 flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Route className="size-5" />
              </span>
              <span className="text-sm font-medium">Browse all routes &amp; terminals</span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            {FEATURES.map(({ Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
