"use client";

import { Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MajorHubs from "@/components/home/MajorHubs";
import StopCombobox from "@/components/StopCombobox";
import SwapButton from "@/components/SwapButton";
import { Button } from "@/components/ui/button";
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

      <MajorHubs onSelect={setOrigin} />

      <Button
        type="submit"
        size="lg"
        disabled={!origin || !destination}
        className="mt-1 w-full font-semibold"
      >
        <Navigation className="size-4" />
        Plan journey
      </Button>
    </form>
  );
}
