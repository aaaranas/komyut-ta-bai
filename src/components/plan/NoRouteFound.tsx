import Link from "next/link";

export default function NoRouteFound({ limited = false }: { limited?: boolean }) {
  return (
    <div className="mt-10">
      <p className="text-base font-semibold">No route found</p>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        {limited
          ? "No trip fits that transfer limit. Allow more transfers to see other options."
          : "These stops aren't connected in our route data yet. Try a nearby terminal or town center; coverage spans the south and north corridors, Metro Cebu, Bantayan, and Camotes."}
      </p>
      <Link href="/routes" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">
        See covered routes
      </Link>
    </div>
  );
}
