import Link from "next/link";
import JourneySearchForm from "@/components/JourneySearchForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-12 pt-14">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl">
          🚌
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Komyut ta Bai
        </h1>
        <p className="mt-2 text-base text-gray-600">
          <span className="font-medium text-primary">Komyut ta Bai</span> —
          Province-wide transport planner for Cebu
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <JourneySearchForm />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Buses, v-hires, jeepneys, and ferries across Cebu province —{" "}
        <Link href="/routes" className="font-medium text-primary underline">
          browse all routes
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-gray-400">
        Works offline after your first visit.
      </p>
    </main>
  );
}
