"use client";

import { Coins, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Preference } from "@/lib/types";

export default function PreferenceToggle({
  value,
  onChange,
}: {
  value: Preference;
  onChange: (preference: Preference) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as Preference)}
      className="mt-4"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="fastest">
          <Zap className="size-4" />
          Fastest
        </TabsTrigger>
        <TabsTrigger value="cheapest">
          <Coins className="size-4" />
          Cheapest
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
