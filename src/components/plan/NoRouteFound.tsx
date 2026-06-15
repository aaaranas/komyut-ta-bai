import { MapPinOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoRouteFound() {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border bg-card p-6 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <MapPinOff className="size-6" />
      </span>
      <p className="mt-3 text-base font-semibold text-foreground">
        No route found
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        We couldn&apos;t find a connection between these stops. Try a nearby
        terminal or major town — our data covers the southern and northern
        corridors, Metro Cebu, Bantayan, and Camotes.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/routes">See covered routes</Link>
      </Button>
    </div>
  );
}
