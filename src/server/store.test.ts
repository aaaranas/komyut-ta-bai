import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import type { FieldValidation } from "@/core/evaluation/metrics";
import type { OfficialObservation } from "@/core/hazards/types";
import type { Report, ReportLabel } from "@/core/sensing/types";
import { JsonStore, type Database, type Store } from "@/server/store";

const now = new Date();
const iso = (offsetMins: number) => new Date(now.getTime() + offsetMins * 60_000).toISOString();

const report = (id: string, extra: Partial<Report> = {}): Report => ({
  id,
  category: "flooding",
  kind: "observation",
  stop_id: "csbt",
  route_id: null,
  details: { flood_level: "impassable" },
  contributor: "p-test",
  observed_at: iso(-5),
  submitted_at: iso(-4),
  distance_to_stop_m: null,
  withdrawn_at: null,
  replay: null,
  ...extra,
});

const official: OfficialObservation = {
  id: "o1",
  source: "dost_asti",
  kind: "sensor_reading",
  title: "Water level",
  summary: "",
  area: { label: "Talisay", lat: 10.24, lng: 123.84, radius_km: 1 },
  reading: { metric: "water_level_m", value: 2, threshold: 1.5 },
  observed_at: iso(-10),
  valid_until: null,
  connection: "manual",
  replay: { scenario_id: "x" },
};

const label: ReportLabel = { report_id: "r1", label: "true", basis: "field_observation", labeled_at: iso(-1), split: "dev" };
const validation: FieldValidation = {
  id: "v1",
  origin_id: "a",
  destination_id: "b",
  depart_at: "2026-11-23T08:00",
  condition: "baseline",
  observed_mins: 42.5,
  baseline_mins: 40,
  enriched_mins: null,
  recorded_at: iso(0),
};

const strip = (db: Readonly<Database>) => JSON.parse(JSON.stringify({ ...db, version: 1 }));

/** The same contract for both backends: what you write is exactly what you read back. */
function contract(name: string, make: () => Promise<Store>) {
  describe(`${name} store contract`, () => {
    it("round-trips every table, including nulls and optional fields", async () => {
      const store = await make();
      await store.write((db) => {
        db.reports.push(report("r1"), report("r2", { route_id: "jeep-01k-outbound", distance_to_stop_m: 40, replay: { scenario_id: "x" } }));
        db.labels.push(label);
        db.official.push(official);
        db.validations.push(validation);
      });
      const read = await store.read(strip);
      assert.deepEqual(read.reports, [report("r1"), report("r2", { route_id: "jeep-01k-outbound", distance_to_stop_m: 40, replay: { scenario_id: "x" } })].sort((a, b) => a.id.localeCompare(b.id)).map((r) => JSON.parse(JSON.stringify(r))).sort((a, b) => a.id.localeCompare(b.id)));
      assert.deepEqual(read.labels, [label]);
      assert.deepEqual(read.official, [official]);
      assert.deepEqual(read.validations, [validation]);
    });

    it("applies updates and deletions", async () => {
      const store = await make();
      await store.write((db) => {
        const r = db.reports.find((x) => x.id === "r1")!;
        r.withdrawn_at = iso(0);
        db.reports = db.reports.filter((x) => x.id !== "r2");
      });
      const reports = await store.read((db) => db.reports);
      assert.deepEqual(reports.map((r) => r.id), ["r1"]);
      assert.equal(reports[0].withdrawn_at, iso(0));
    });

    it("serializes concurrent writes", async () => {
      const store = await make();
      await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          store.write((db) => {
            db.reports.push(report(`c${i}`));
          })
        )
      );
      const ids = await store.read((db) => db.reports.map((r) => r.id).filter((id) => id.startsWith("c")));
      assert.equal(ids.length, 8);
    });
  });
}

const tempDirs: string[] = [];
let jsonStore: JsonStore | null = null;
contract("JSON", async () => {
  if (!jsonStore) {
    const dir = await mkdtemp(join(tmpdir(), "komyut-store-test-"));
    tempDirs.push(dir);
    process.env.KOMYUT_DATA_DIR = dir;
    jsonStore = new JsonStore();
  }
  return jsonStore;
});

// Runs only against a disposable database: TEST_DATABASE_URL=postgresql://… npm test
const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl) {
  let pg: Store | null = null;
  contract("Postgres", async () => {
    if (!pg) {
      const { PostgresStore } = await import("@/server/postgres-store");
      const created = new PostgresStore(testUrl);
      await created.write((db) => {
        for (const key of ["reports", "labels", "official", "segments", "traces", "validations"] as const) db[key] = [];
      });
      pg = created;
      after(() => created.prisma.$disconnect());
    }
    return pg;
  });
}

after(async () => {
  for (const dir of tempDirs) await rm(dir, { recursive: true, force: true });
});
