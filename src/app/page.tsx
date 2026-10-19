import Link from "next/link";
import LiveNow from "@/components/home/LiveNow";
import JourneySearchForm from "@/components/search/JourneySearchForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-8 md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:gap-16 md:pt-14">
      <div>
        <h1 className="text-[2.5rem] font-extrabold leading-[1.05] tracking-[-0.03em]">Where to, bai?</h1>
        <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">
          Routes across Cebu&apos;s jeepneys, MyBus, V-hires, buses, and ferries, adjusted for what commuters are
          reporting right now.
        </p>
        <div className="mt-7">
          <JourneySearchForm />
        </div>
      </div>

      <div className="mt-12 md:mt-[5.5rem]">
        <LiveNow />
        <p className="mt-8 text-sm text-muted-foreground">
          Looking for a specific jeepney or bus?{" "}
          <Link href="/routes" className="font-medium text-foreground underline underline-offset-4">
            Browse routes
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
