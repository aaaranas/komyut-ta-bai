"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StopCombobox from "@/components/StopCombobox";
import SwapButton from "@/components/SwapButton";
import { getStop } from "@/lib/catalog";
import type { Stop } from "@/lib/types";

interface JourneySearchFormProps {
  initialFrom?: string;
  initialTo?: string;
}

export default function JourneySearchForm({
  initialFrom,
  initialTo,
}: JourneySearchFormProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState<Stop | null>(
    initialFrom ? getStop(initialFrom) ?? null : null
  );
  const [destination, setDestination] = useState<Stop | null>(
    initialTo ? getStop(initialTo) ?? null : null
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!origin || !destination) return;
    router.push(`/plan?from=${origin.id}&to=${destination.id}`);
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3">
      <StopCombobox
        label="From"
        placeholder="e.g. Argao"
        value={origin}
        onChange={setOrigin}
      />
      <div className="flex justify-center">
        <SwapButton onSwap={handleSwap} />
      </div>
      <StopCombobox
        label="To"
        placeholder="e.g. Santa Fe, Bantayan Island"
        value={destination}
        onChange={setDestination}
      />
      <button
        type="submit"
        disabled={!origin || !destination}
        className="mt-2 h-13 min-h-12 rounded-xl bg-primary text-base font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Plan journey
      </button>
    </form>
  );
}
