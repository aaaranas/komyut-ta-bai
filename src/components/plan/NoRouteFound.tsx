import Link from "next/link";

export default function NoRouteFound() {
  return (
    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
      <p className="text-base font-semibold text-amber-800">No route found</p>
      <p className="mt-1 text-sm text-amber-700">
        We couldn&apos;t find a connection between these stops. Try a nearby
        terminal or major town — our route data covers the southern and
        northern corridors, Metro Cebu, Bantayan, and Camotes.
      </p>
      <Link
        href="/routes"
        className="mt-3 inline-block text-sm font-medium text-primary underline"
      >
        See covered routes
      </Link>
    </div>
  );
}
