import { ArrowRight, Bus, Coins, Route, WifiOff } from "lucide-react";
import Link from "next/link";
import MapBackdrop from "@/components/home/MapBackdrop";
import RouteBackdrop from "@/components/home/RouteBackdrop";
import JourneySearchForm from "@/components/JourneySearchForm";
import { Card } from "@/components/ui/card";
import { routes, stops } from "@/lib/catalog";
import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/types";

/** Modes advertised in the hero, in rider-familiar order. */
const COVERAGE_MODES: Mode[] = [
  "jeepney",
  "mjeepney",
  "bus",
  "mybus",
  "vhire",
  "ferry",
];

/** Trust signals shown beside the search. */
const FEATURES = [
  { Icon: Route, label: "Multimodal" },
  { Icon: Coins, label: "Fare totals" },
  { Icon: WifiOff, label: "Works offline" },
];

/** Live dataset figures, computed at build time. */
const STATS = [
  { value: routes.length, label: "routes" },
  { value: stops.length, label: "stops" },
  {
    value: new Set(stops.map((stop) => stop.municipality)).size,
    label: "towns & cities",
  },
];

export default function Home() {
  return (
    <main className="bg-landing relative isolate flex flex-1 flex-col lg:justify-center">
      <MapBackdrop />
      <div className="mx-auto w-full max-w-6xl pb-12 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10 lg:px-6 lg:pb-0 lg:pt-0">
        <section className="relative isolate overflow-hidden rounded-b-3xl bg-gradient-to-b from-primary to-primary/80 px-6 pb-14 pt-12 text-center text-primary-foreground lg:flex lg:flex-col lg:justify-center lg:rounded-3xl lg:py-16 lg:text-left">
          <RouteBackdrop />
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-gold text-gold-foreground shadow-sm lg:mx-0">
            <Bus className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Komyut ta Bai
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-balance text-sm text-primary-foreground/90 lg:mx-0 lg:max-w-md lg:text-base">
            Door-to-door public transport directions for all of Cebu — fares,
            transfers, and travel times included. Even offline.
          </p>

          <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {COVERAGE_MODES.map((mode) => {
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
                <dt className="text-2xl font-bold leading-none tabular-nums">
                  {value}
                </dt>
                <dd className="mt-1 text-xs text-primary-foreground/75">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="-mt-7 px-4 lg:mt-0 lg:px-0">
          <Card className="p-5 shadow-lg">
            <JourneySearchForm />
          </Card>

          <div className="mt-6">
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

            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              {FEATURES.map(({ Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-xs text-muted-foreground lg:text-left">
              Works offline after your first visit. No signal needed sa bukid.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
