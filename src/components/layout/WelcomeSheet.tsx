"use client";

import { MapPin, Navigation, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { updateConsent, useConsent } from "@/hooks/useConsent";
import { STORAGE_KEYS, readString, writeString } from "@/lib/storage";

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4">
      <span>
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--foreground)]"
      />
    </label>
  );
}

export default function WelcomeSheet() {
  const consent = useConsent();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const already = readString(STORAGE_KEYS.onboarded);
    if (!already) setOpen(true);
  }, []);

  const dismiss = () => {
    writeString(STORAGE_KEYS.onboarded, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Komyut ta Bai"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-foreground text-background">
            <Navigation className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">Komyut ta Bai</h1>
            <p className="text-xs text-muted-foreground">Cebu transit planner</p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed">
          Find routes across Cebu&apos;s jeepneys, MyBus, V-hires, buses, and ferries — adjusted live from what
          commuters are reporting.
        </p>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your data choices</p>

          <Toggle
            checked={consent.reportLocation === "granted"}
            onChange={(checked) => updateConsent({ reportLocation: checked ? "granted" : "denied" })}
            title={
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                Attach location to reports
              </span>
            }
            description="Only your distance from the stop is kept. Coordinates are discarded."
          />

          <Toggle
            checked={consent.rideTraces}
            onChange={(checked) => updateConsent({ rideTraces: checked })}
            title={
              <span className="flex items-center gap-1.5">
                <Waves className="size-3.5 shrink-0" />
                Share ride times
              </span>
            }
            description="Stop-to-stop durations computed on your phone. Raw GPS never leaves it."
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          No account needed. You can change these any time under Privacy.
        </p>

        <Button size="lg" className="mt-5 w-full" onClick={dismiss}>
          Get started
        </Button>
      </div>
    </div>
  );
}
