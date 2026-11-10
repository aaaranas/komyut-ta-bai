import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Komyut ta Bai",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">About</h1>

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Thesis</h2>
        <p className="mt-2 text-[15px] font-semibold leading-snug">
          Komyut ta Bai: A Participatory Sensing Framework for Real-Time Transit Data Enrichment in Cebu&apos;s
          Informal Public Transportation Network
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          BS Computer Science Special Problem · UP Cebu · October 2026
        </p>
      </section>

      <section className="mt-8 border-t pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What it does</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed">
          Komyut ta Bai is an offline-first Progressive Web Application that combines a multimodal route planner with a
          participatory sensing layer. Commuters submit real-time observations — delays, flooding, full vehicles, and
          road disruptions — which are verified using a confidence scoring formula before they adjust route
          recommendations.
        </p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed">
          The sensing layer is Soft IoT: it treats every smartphone as a sensor node, requiring no hardware
          installation. Official hazard feeds from PAGASA, DOST-ASTI, and PHIVOLCS are ingested alongside commuter
          reports to corroborate or expedite verification.
        </p>
      </section>

      <section className="mt-8 border-t pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Verification formula
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border bg-muted/40 px-4 py-3">
          <code className="font-mono text-sm">
            C = 1 − ∏ (1 − R<sub>i</sub> · e<sup>−Δt<sub>i</sub>/τ<sub>k</sub></sup>)
          </code>
        </div>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Confidence score <em>C</em> for an event, combining independent evidence pieces weighted by contributor
          reputation <em>R</em> and evidence age relative to the category half-life <em>τ</em>.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border bg-muted/40 px-4 py-3">
          <code className="font-mono text-sm">
            R<sub>u</sub> = (r<sub>u</sub> + 1) / (r<sub>u</sub> + s<sub>u</sub> + 2)
          </code>
        </div>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Contributor reputation derived from beta-distribution expected value (Jøsang &amp; Ismail, 2002), based on
          verified correct reports <em>r</em> and incorrect reports <em>s</em>.
        </p>
      </section>

      <section className="mt-8 border-t pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Transit modes covered
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
          {[
            "PUJ (Traditional jeepney)",
            "e-PUJ (Modern jeepney)",
            "MyBus (BRT)",
            "Provincial bus (Ceres)",
            "V-hire (Van)",
            "Ferry (inter-island)",
          ].map((mode) => (
            <li key={mode} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
              {mode}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 border-t pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System modules</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {[
            ["M1", "Android PWA Client — route search, report submission, ride tracking"],
            ["M2", "Authentication — pseudonymous device identity, no account required"],
            ["M3", "Report Intake & Verification — parse, validate, and cluster reports"],
            ["M4", "Trace Processing — derive stop-to-stop travel times from GPS traces"],
            ["M5", "Hazard Ingestion — PAGASA, DOST-ASTI, PHIVOLCS official feeds"],
            ["M6", "Confidence Scoring & Event Expiry — formula above, per-category half-life"],
            ["M7", "Transit Dataset & Graph — stop/route graph for Dijkstra planning"],
            ["M8", "Route Planning & Alerts — multimodal planner with live event overlay"],
          ].map(([id, desc]) => (
            <li key={id} className="flex gap-3">
              <span className="shrink-0 font-mono text-xs font-semibold text-muted-foreground">{id}</span>
              <span>{desc}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 border-t pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Privacy</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No login needed. Reports are linked to a pseudonym derived from a random device ID — not your name, number,
          or account. You can erase everything under{" "}
          <Link href="/privacy" className="font-medium text-foreground underline underline-offset-4">
            Privacy
          </Link>
          .
        </p>
      </section>

      <div className="mt-10 border-t pt-6">
        <Link href="/" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Back to plan
        </Link>
      </div>
    </main>
  );
}
