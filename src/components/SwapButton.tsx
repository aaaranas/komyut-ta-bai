"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SwapButton({ onSwap }: { onSwap: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Swap origin and destination"
      onClick={onSwap}
      className="size-9 rounded-full bg-card text-muted-foreground hover:text-primary"
    >
      <ArrowUpDown className="size-4" />
    </Button>
  );
}
